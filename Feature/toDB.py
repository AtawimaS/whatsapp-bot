from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, bindparam
import json
import re

# Inisialisasi koneksi database
database_url = "postgresql://postgres:root@localhost:5433/waDB"
engine = create_engine(database_url)

SessionLocal = sessionmaker(bind=engine)

# add transaction to db
def add_transaction(creditors, debtors, values, type, description=""):
    db = SessionLocal()
    try:
        query = text("""
            INSERT INTO trx_log (debtor, creditor, value, type, description)
            VALUES (:debtor, :creditor, :value, :type, :description)
        """)
        
        if isinstance(debtors, list):
            for debtor, creditor, value in zip(debtors, creditors, values):
                debtor_re = re.findall("[0-9]", debtor)
                creditor_re = re.findall("[0-9]", creditor)
                debtor = ''.join(debtor_re)
                creditor = ''.join(creditor_re)
                db.execute(query, {
                    "debtor": debtor,
                    "creditor": creditor,
                    "value": value,
                    "type": type,
                    "description": description
                })
        else:
            debtor_re = re.findall("[0-9]", debtors)
            creditor_re = re.findall("[0-9]", creditors)
            debtor = ''.join(debtor_re)
            creditor = ''.join(creditor_re)
            db.execute(query, {
                "debtor": debtor,
                "creditor": creditor,
                "value": values,
                "type": type,
                "description": description
            })
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def view_debt(peoples):
    db = SessionLocal()
    all_people = []
    
    if isinstance(peoples, list):
        for people in peoples:
            people_re = re.findall("[0-9]", people)
            people_num = ''.join(people_re)
            all_people.append(people_num)
    else:
        people_re = re.findall("[0-9]", peoples)
        people_num = ''.join(people_re)
        all_people = [people_num] 
    
    try:
        query = text("""
            SELECT * FROM vw_total_debt
            WHERE debtor IN :people OR creditor IN :people
        """).bindparams(bindparam("people", expanding=True))
        
        result = db.execute(query, {"people": all_people})
        rows = result.fetchall()
        columns = result.keys()
        result_list = [dict(zip(columns, row)) for row in rows]
        
        return result_list
    except Exception as e:
        raise e
    finally:
        db.close()
