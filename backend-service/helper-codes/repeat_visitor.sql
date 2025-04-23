UPDATE visitors AS v1
SET is_repeat_visitor = CASE
    WHEN EXISTS (
        SELECT 1
        FROM visitors AS v2
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
    THEN 'Y'
    ELSE 'N'
END;