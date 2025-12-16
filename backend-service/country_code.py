import sqlite3
import pycountry

def convert_country_code_to_name(code):
    try:
        country = pycountry.countries.get(alpha_2=code)
        return country.name if country else code
    except:
        return code

def clean_row_country(name):
    actual_name = name
    if len(name) == 2:
        actual_name = convert_country_code_to_name(name)
    return actual_name

if __name__ == "__main__":
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT rowid, country_name FROM visitors")
    rows = cursor.fetchall()
    for rowid, country_name in rows:
        if not country_name:
            continue
        cleaned = clean_row_country(country_name)
        if cleaned != country_name:
            print(f"Updating row {rowid} from {country_name} to {cleaned}")
            cursor.execute("UPDATE visitors SET country_name = ? WHERE rowid = ?", (cleaned, rowid))

    conn.commit()
    conn.close()
    print("All country codes updated successfully.")
