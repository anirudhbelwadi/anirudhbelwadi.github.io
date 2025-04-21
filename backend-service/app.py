from flask import Flask, jsonify, render_template, request
import sqlite3
import os
from datetime import datetime
import requests
import json

app = Flask(__name__)
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

def fetchActualSource(source):
    if "linkedin" in source.lower():
        if "www" in source.lower():
            return "LinkedIn Web"
        else:
            return "LinkedIn Mobile"
    if "facebook" in source.lower():
        return "Facebook"
    if "twitter" in source.lower():
        return "Twitter"
    if "instagram" in source.lower():
        return "Instagram"
    if "google" in source.lower():
        return "Google"
    if "github" in source.lower():
        return "GitHub"
    if "linktr.ee" in source.lower():
        return "Linktree"
    return source

def getData(database_cursor):
    week_data = database_cursor.execute("""
        WITH RECURSIVE dates(day) AS (
            SELECT date('now', '-6 days')
            UNION ALL
            SELECT date(day, '+1 day')
            FROM dates
            WHERE day < date('now')
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) BETWEEN date('now', '-6 days') AND date('now')
        )
        SELECT
            dates.day AS label,
            COUNT(formatted_table.date_part) AS count
        FROM dates
        LEFT JOIN formatted_table ON dates.day = formatted_table.date_part
        GROUP BY dates.day;
    """).fetchall()
    month_data = database_cursor.execute("""
        WITH RECURSIVE dates(day) AS (
            SELECT date('now', '-29 days')
            UNION ALL
            SELECT date(day, '+1 day')
            FROM dates
            WHERE day < date('now')
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) BETWEEN date('now', '-29 days') AND date('now')
        )
        SELECT
            dates.day AS label,
            COUNT(formatted_table.date_part) AS count
        FROM dates
        LEFT JOIN formatted_table ON dates.day = formatted_table.date_part
        GROUP BY dates.day;
    """).fetchall()
    year_data = database_cursor.execute("""
        WITH RECURSIVE months(month_start) AS (
            SELECT date('now', 'start of month', '-11 months')
            UNION ALL
            SELECT date(month_start, '+1 month')
            FROM months
            WHERE month_start < date('now', 'start of month')
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) >= date('now', 'start of month', '-11 months')
        )
        SELECT
            strftime('%m-%Y', months.month_start) AS label,
            COUNT(formatted_table.date_part) AS count
        FROM months
        LEFT JOIN formatted_table
            ON strftime('%Y-%m', formatted_table.date_part) = strftime('%Y-%m', months.month_start)
        GROUP BY months.month_start;
    """).fetchall()
    five_years_data = database_cursor.execute("""
        WITH RECURSIVE years(year_start) AS (
            SELECT date('now', 'start of year', '-5 years')
            UNION ALL
            SELECT date(year_start, '+1 year')
            FROM years
            WHERE year_start < date('now', 'start of year')
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp,7,4) || '-' ||
                substr(timestamp,4,2) || '-' ||
                substr(timestamp,1,2)
            ) >= date('now', 'start of year', '-5 years')
        )
        SELECT
            strftime('%Y', years.year_start) AS label,
            COUNT(formatted_table.date_part) AS count
        FROM years
        LEFT JOIN formatted_table
            ON strftime('%Y', formatted_table.date_part) = strftime('%Y', years.year_start)
        GROUP BY years.year_start;
    """).fetchall()

    # Today's Visitors
    today = datetime.now().strftime("%d/%m/%Y")
    todays_visitors = database_cursor.execute("""
        SELECT COUNT(*) FROM visitors WHERE timestamp LIKE ?
    """, (f"{today}%",)).fetchone()[0]

    # Visits This Week
    visits_this_week = sum(row[1] for row in week_data)

    # Visits This Month
    visits_this_month = sum(row[1] for row in month_data)

    # Peak Visit Day (Last 30 Days)
    peak_day, peak_count = max(month_data, key=lambda x: x[1]) if month_data else ("-", 0)

    # Top Country
    top_country = database_cursor.execute("""
        SELECT country_name, COUNT(*) as cnt FROM visitors WHERE country_name IS NOT NULL
        GROUP BY country_name ORDER BY cnt DESC LIMIT 1
    """).fetchone()
    top_country = top_country[0] if top_country else "-"

    # Top Source
    top_source = database_cursor.execute("""
         SELECT source, COUNT(*) as cnt FROM visitors WHERE source IS NOT NULL AND source != ""  GROUP BY source ORDER BY cnt DESC LIMIT 1;
    """).fetchone()
    top_source = top_source[0] if top_source else "-"

    top_source = fetchActualSource(top_source) if top_source != "-" else "-"

    # Avg. Visits Per Day (Last 30 Days)
    avg_per_day = round(visits_this_month / 30, 2) if month_data else 0

    # Avg. Visits Per Week (Last 12 Months)
    avg_per_week = round(sum(row[1] for row in year_data) / 52, 2) if year_data else 0

    # Top 5 Cities or Regions
    city_counts = database_cursor.execute("""
        SELECT city || ', ' || region as location, COUNT(*) as cnt FROM visitors WHERE city IS NOT NULL AND region IS NOT NULL
        GROUP BY location HAVING location IS NOT NULL ORDER BY cnt DESC LIMIT 5
    """).fetchall()

    return {
        "week_data": week_data,
        "month_data": month_data,
        "year_data": year_data,
        "five_years_data": five_years_data,
        "kpis": {
            "todays_visitors": todays_visitors,
            "visits_this_week": visits_this_week,
            "visits_this_month": visits_this_month,
            "peak_day": peak_day,
            "peak_day_count": peak_count,
            "top_country": top_country,
            "top_source": top_source,
            "avg_per_day": avg_per_day,
            "avg_per_week": avg_per_week,
            "top_locations": city_counts
        }
    }

@app.route('/admin/viewVisitors')
def viewVisitors():
    database_location = os.path.join(THIS_FOLDER, 'database.db')
    database_connection = sqlite3.connect(database_location)
    database_cursor = database_connection.cursor()
    dashboard_visitor_count = int(database_cursor.execute("SELECT count FROM dashboard_visitors").fetchone()[0])
    database_cursor.execute("UPDATE dashboard_visitors SET count = ? WHERE count = ?",(dashboard_visitor_count+1,dashboard_visitor_count))
    count = int(database_cursor.execute("SELECT count FROM visit").fetchone()[0])
    visitors = database_cursor.execute("SELECT * FROM visitors ORDER BY strftime('%Y-%m-%d %H:%M:%S', substr(timestamp, 7, 4) || '-' || substr(timestamp, 4, 2) || '-' ||  substr(timestamp, 1, 2) || ' ' || substr(timestamp, 12)) DESC;").fetchall()
    analytics_data = getData(database_cursor)
    #analytics_data = {}
    database_connection.commit()
    database_connection.close()
    return render_template('index.html', count = count, visitors=visitors, analytics_data = analytics_data)

@app.route('/counterIncrease/<string:ip>',methods=["GET"])
def hello_world(ip):
    now = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    database_location = os.path.join(THIS_FOLDER, 'database.db')
    database_connection = sqlite3.connect(database_location)
    database_cursor = database_connection.cursor()
    count = int(database_cursor.execute("SELECT count FROM visit").fetchone()[0])
    location_response = {}
    location_data = {}
    try:
        web_source = request.args.get('source', default="", type=str)
        domain = request.args.get('domain', default="", type=str)
        if domain != "true":
            raise Exception("Invalid domain")
        location_response = json.loads(requests.get('https://ipapi.co/'+ip+'/json/').text)
        location_data = {
            "ip": ip,
            "city": location_response["city"],
            "region": location_response["region"],
            "country": location_response["country_name"]
        }
        database_cursor.execute("INSERT into visitors VALUES (?,?,?,?,?,?)",(ip,now,location_response.get("city"),location_response.get("region"),location_response.get("country_name"),web_source))
        database_cursor.execute("UPDATE visit SET count = ? WHERE count = ?",(count+1,count))
        count = count + 1
    except Exception as e:
        print("Error:", e)
    database_connection.commit()
    database_connection.close()
    message = {'count': count }
    response = jsonify(message)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(debug=True)