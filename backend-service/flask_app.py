from flask import Flask, jsonify, render_template, request
import sqlite3
import os
from datetime import datetime, timedelta
import requests
import pytz
from dateutil.relativedelta import relativedelta
from country_code import clean_row_country
import json
from fetch_gist import fetch_gist_json

current_timezone = pytz.timezone('America/New_York')
app = Flask(__name__)
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

@app.route('/source-config/batch', methods=['POST'])
def source_config_batch():
    payload = request.get_json(silent=True) or {}
    sources = payload.get('sources', [])
    config_data = fetchRemoteSourceConfig()
    resolved = {}
    for source in sources:
        if source in resolved:
            continue
        resolved[source] = resolveSourceFromConfig(config_data, source)
    return jsonify({"mapping": resolved})

@app.route('/')
def analytics_readme():
    return render_template('analytics_readme.html')

def fetchLocalSourceConfig():
    try:
        with open(os.path.join(THIS_FOLDER, 'source_config.json'), 'r') as file:
            json_data = json.load(file)
            return json_data
    except Exception as e:
        print(f"Error reading local source config: {e}")
        return None

def fetchRemoteSourceConfig():
    try:
        json_data = fetch_gist_json()
        return json_data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Gist: {e}")
        return fetchLocalSourceConfig()
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return fetchLocalSourceConfig()
    except Exception as e:
        print(f"Unexpected error: {e}")
        return fetchLocalSourceConfig()

def fetchActualSource(source):
    config_data = fetchRemoteSourceConfig()
    return resolveSourceFromConfig(config_data, source)

def resolveSourceFromConfig(config_data, source):
    source_lower = source.lower()
    if config_data:
        mappings = config_data.get("mappings", [])
        for mapping in mappings:
            keywords = mapping.get("keywords", [])
            match_all = mapping.get("match_all", False)
            if match_all:
                if all(keyword.lower() in source_lower for keyword in keywords):
                    return mapping.get("display_name", source)
            else:
                if any(keyword.lower() in source_lower for keyword in keywords):
                    return mapping.get("display_name", source)
    return source


def getData(database_cursor):
    today = datetime.now(current_timezone)
    today_db_format = datetime.now(current_timezone).strftime("%d/%m/%Y")
    today_str = today.strftime("%Y-%m-%d")

    six_days_ago_str = (today - timedelta(days=6)).strftime("%Y-%m-%d")
    week_data = database_cursor.execute("""
        WITH RECURSIVE dates(day) AS (
            SELECT date(?)  -- six days ago
            UNION ALL
            SELECT date(day, '+1 day')
            FROM dates
            WHERE day < date(?)  -- today
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) BETWEEN date(?) AND date(?)
        )
        SELECT
            dates.day AS label,
            COUNT(formatted_table.date_part) AS count
        FROM dates
        LEFT JOIN formatted_table ON dates.day = formatted_table.date_part
        GROUP BY dates.day;
    """, (six_days_ago_str, today_str, six_days_ago_str, today_str)).fetchall()
    twenty_nine_days_ago_str = (today - timedelta(days=29)).strftime("%Y-%m-%d")
    month_data = database_cursor.execute("""
        WITH RECURSIVE dates(day) AS (
            SELECT date(?)  -- 29 days ago
            UNION ALL
            SELECT date(day, '+1 day')
            FROM dates
            WHERE day < date(?)  -- today
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) BETWEEN date(?) AND date(?)
        )
        SELECT
            dates.day AS label,
            COUNT(formatted_table.date_part) AS count
        FROM dates
        LEFT JOIN formatted_table ON dates.day = formatted_table.date_part
        GROUP BY dates.day;
    """, (twenty_nine_days_ago_str,today_str, twenty_nine_days_ago_str,today_str)).fetchall()

    this_month_start = today.replace(day=1)
    eleven_months_ago = this_month_start - relativedelta(months=11)
    start_month_str = eleven_months_ago.strftime("%Y-%m-%d")
    end_month_str = this_month_start.strftime("%Y-%m-%d")
    year_data = database_cursor.execute("""
        WITH RECURSIVE months(month_start) AS (
            SELECT date(?)
            UNION ALL
            SELECT date(month_start, '+1 month')
            FROM months
            WHERE month_start < date(?)
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) >= date(?)
        )
        SELECT
            strftime('%m-%Y', months.month_start) AS label,
            COUNT(formatted_table.date_part) AS count
        FROM months
        LEFT JOIN formatted_table
            ON strftime('%Y-%m', formatted_table.date_part) = strftime('%Y-%m', months.month_start)
        GROUP BY months.month_start;
    """, (start_month_str, end_month_str, start_month_str)).fetchall()

    this_year_start = today.replace(month=1, day=1)
    five_years_ago = this_year_start - relativedelta(years=5)
    start_year_str = five_years_ago.strftime("%Y-%m-%d")
    end_year_str = this_year_start.strftime("%Y-%m-%d")
    five_years_data = database_cursor.execute("""
        WITH RECURSIVE years(year_start) AS (
            SELECT date(?)
            UNION ALL
            SELECT date(year_start, '+1 year')
            FROM years
            WHERE year_start < date(?)
        ),
        formatted_table AS (
            SELECT date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) AS date_part
            FROM visitors
            WHERE date(
                substr(timestamp, 7, 4) || '-' ||
                substr(timestamp, 4, 2) || '-' ||
                substr(timestamp, 1, 2)
            ) >= date(?)
        )
        SELECT
            strftime('%Y', years.year_start) AS label,
            COUNT(formatted_table.date_part) AS count
        FROM years
        LEFT JOIN formatted_table
            ON strftime('%Y', formatted_table.date_part) = strftime('%Y', years.year_start)
        GROUP BY years.year_start;
    """, (start_year_str, end_year_str, start_year_str)).fetchall()
    # Today's Visitors
    todays_visitors = database_cursor.execute("""
        SELECT COUNT(*) FROM visitors WHERE timestamp LIKE ?
    """, (f"{today_db_format}%",)).fetchone()[0]

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

    # Repeat Visitors (Last 24 Hours)
    now_date_time = today
    cutoff_date_time = now_date_time - timedelta(hours=24)
    now_iso = now_date_time.strftime("%Y-%m-%d %H:%M:%S")
    cutoff_iso = cutoff_date_time.strftime("%Y-%m-%d %H:%M:%S")
    repeat_visitors_last_24h = database_cursor.execute("""
        SELECT COUNT(DISTINCT ip)
        FROM visitors
        WHERE is_repeat_visitor = 'Y'
          AND datetime(
              substr(timestamp, 7, 4) || '-' ||
              substr(timestamp, 4, 2) || '-' ||
              substr(timestamp, 1, 2) || ' ' ||
              substr(timestamp, 12)
          ) BETWEEN datetime(?) AND datetime(?)
    """, (cutoff_iso, now_iso)).fetchone()[0]
    repeat_visitors_last_24h = repeat_visitors_last_24h if repeat_visitors_last_24h else 0
    # average repeat visitors per day in last 6 months grouped by day and averaged
    repeat_visitors_per_day = database_cursor.execute("""
        SELECT AVG(daily_repeat_ips) AS avg_repeat_ips_per_day
        FROM (
            SELECT
                visit_date,
                COUNT(DISTINCT ip) AS daily_repeat_ips
            FROM (
                SELECT
                    v1.ip,
                    date(
                        substr(v1.timestamp, 7, 4) || '-' ||
                        substr(v1.timestamp, 4, 2) || '-' ||
                        substr(v1.timestamp, 1, 2)
                    ) AS visit_date
                FROM visitors v1
                WHERE EXISTS (
                    SELECT 1
                    FROM visitors v2
                    WHERE v2.ip = v1.ip
                      AND date(
                          substr(v2.timestamp, 7, 4) || '-' ||
                          substr(v2.timestamp, 4, 2) || '-' ||
                          substr(v2.timestamp, 1, 2)
                      ) = date(
                          substr(v1.timestamp, 7, 4) || '-' ||
                          substr(v1.timestamp, 4, 2) || '-' ||
                          substr(v1.timestamp, 1, 2)
                      )
                      AND v2.rowid < v1.rowid
                )
                AND date(
                    substr(v1.timestamp, 7, 4) || '-' ||
                    substr(v1.timestamp, 4, 2) || '-' ||
                    substr(v1.timestamp, 1, 2)
                ) >= ?
            )
            GROUP BY visit_date
        ) AS daily_repeats;
    """, (
        (today - timedelta(days=180)).strftime("%Y-%m-%d"),
    )).fetchone()[0]
    repeat_visitors_per_day = round(repeat_visitors_per_day, 2) if repeat_visitors_per_day else 0
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
            "top_locations": city_counts,
            "repeat_visitors_last_24h": repeat_visitors_last_24h,
            "repeat_visitors_per_day": repeat_visitors_per_day,
        }
    }

@app.route('/admin/viewVisitors/')
def viewVisitors():
    database_location = os.path.join(THIS_FOLDER, 'database.db')
    database_connection = sqlite3.connect(database_location)
    database_cursor = database_connection.cursor()
    dashboard_visitor_count = int(database_cursor.execute("SELECT count FROM dashboard_visitors").fetchone()[0])
    database_cursor.execute("UPDATE dashboard_visitors SET count = ? WHERE count = ?",(dashboard_visitor_count+1,dashboard_visitor_count))
    count = int(database_cursor.execute("SELECT COUNT(*) FROM visitors").fetchone()[0])
    visitors = database_cursor.execute("SELECT * FROM visitors ORDER BY strftime('%Y-%m-%d %H:%M:%S', substr(timestamp, 7, 4) || '-' || substr(timestamp, 4, 2) || '-' ||  substr(timestamp, 1, 2) || ' ' || substr(timestamp, 12)) DESC;").fetchall()
    analytics_data = getData(database_cursor)
    #analytics_data = {}
    database_connection.commit()
    database_connection.close()
    return render_template('index.html', count = count, visitors=visitors, analytics_data = analytics_data)

@app.route('/admin/viewVisitors/allVisitors/')
def allVisitors():
    database_location = os.path.join(THIS_FOLDER, 'database.db')
    database_connection = sqlite3.connect(database_location)
    database_cursor = database_connection.cursor()
    visitors = database_cursor.execute("SELECT * FROM visitors ORDER BY strftime('%Y-%m-%d %H:%M:%S', substr(timestamp, 7, 4) || '-' || substr(timestamp, 4, 2) || '-' ||  substr(timestamp, 1, 2) || ' ' || substr(timestamp, 12)) DESC;").fetchall()
    database_connection.close()
    visitors_list = []
    for visitor in visitors:
        visitors_list.append({
            "ip": visitor[0],
            "timestamp": visitor[1],
            "city": visitor[2],
            "region": visitor[3],
            "country_name": visitor[4],
            "source": visitor[5],
            "is_repeat_visitor": visitor[6],
            "postal": visitor[7]
        })
    return render_template('all_visitors.html', visitors=visitors_list)

@app.route('/counterIncrease/<string:ip>',methods=["GET"])
def counterIncrease(ip):
    now_date_time = datetime.now(current_timezone)
    now = now_date_time.strftime("%d/%m/%Y %H:%M:%S")
    database_location = os.path.join(THIS_FOLDER, 'database.db')
    database_connection = sqlite3.connect(database_location)
    database_cursor = database_connection.cursor()
    location_response = {}
    visit_id = None
    is_repeat_visitor_last_24h = "N"
    try:
        web_source = request.args.get('source', default="", type=str)
        domain = request.args.get('domain', default="", type=str)
        is_mobile_param = request.args.get('is_mobile', default="", type=str)
        is_mobile_flag = "Y" if is_mobile_param.lower() in {"true", "1", "yes", "y"} else "N"
        if domain != "true":
            raise Exception("Invalid domain")
        location_response = (requests.get(f"https://ipinfo.io/{ip}/json")).json()
        cutoff_date_time = now_date_time - timedelta(hours=24)
        now_iso = now_date_time.strftime("%Y-%m-%d %H:%M:%S")
        cutoff_iso = cutoff_date_time.strftime("%Y-%m-%d %H:%M:%S")
        count_of_visit_by_same_ip_last_24h = database_cursor.execute("""
            SELECT COUNT(*)
            FROM visitors
            WHERE ip = ?
              AND datetime(
                  substr(timestamp, 7, 4) || '-' ||
                  substr(timestamp, 4, 2) || '-' ||
                  substr(timestamp, 1, 2) || ' ' ||
                  substr(timestamp, 12)
              ) BETWEEN datetime(?) AND datetime(?)
        """, (ip, cutoff_iso, now_iso)).fetchone()[0]
        if count_of_visit_by_same_ip_last_24h == 0:
            is_repeat_visitor_last_24h = "N"
        else:
            is_repeat_visitor_last_24h = "Y"
        cleaned_country = location_response.get("country")
        if cleaned_country is not None:
            cleaned_country = clean_row_country(cleaned_country)
        database_cursor.execute(
            "INSERT into visitors (ip, timestamp, city, region, country_name, source, is_repeat_visitor, postal, visitor_name, visitor_role, is_mobile) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (ip, now, location_response.get("city"), location_response.get("region"), cleaned_country, web_source, is_repeat_visitor_last_24h, location_response.get("postal"), None, None, is_mobile_flag)
        )
        visit_id = database_cursor.lastrowid
    except Exception as e:
        print("Error:", e)
    count = int(database_cursor.execute("SELECT COUNT(*) FROM visitors").fetchone()[0])
    database_connection.commit()
    database_connection.close()
    message = {
        'count': count,
        'visit_id': visit_id,
        'is_repeat_visitor': is_repeat_visitor_last_24h
    }
    response = jsonify(message)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/visitMeta/<int:visit_id>', methods=["POST", "OPTIONS"])
def visitMeta(visit_id):
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    payload = request.get_json(silent=True) or {}
    visitor_name = (payload.get('name') or "").strip()
    visitor_role = (payload.get('role') or "").strip()

    database_location = os.path.join(THIS_FOLDER, 'database.db')
    database_connection = sqlite3.connect(database_location)
    database_cursor = database_connection.cursor()
    database_cursor.execute(
        "UPDATE visitors SET visitor_name = ?, visitor_role = ? WHERE rowid = ?",
        (visitor_name, visitor_role, visit_id)
    )
    database_connection.commit()
    database_connection.close()

    response = jsonify({"status": "saved"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(debug=True)