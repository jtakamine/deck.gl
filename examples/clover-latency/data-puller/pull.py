#!/usr/bin/env python

import time
import os
from subprocess import call
from datetime import datetime, timedelta


HOST = 'clickhouse1.dev.clover.com'
DATABASE = 'log'
TABLE = 'haproxy_log2'

CLICKHOUSE_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
DATE_FORMAT = '%m-%d-%y %H:%M:%S'

START_TIME_STR = os.environ.get('START_TIME', '03-15-18 00:00:00')
START_TIME = datetime.strptime(START_TIME_STR, DATE_FORMAT)
END_TIME_STR = os.environ.get('END_TIME', '03-15-18 00:10:59')
END_TIME = datetime.strptime(END_TIME_STR, DATE_FORMAT)

SLEEP_ON_COMPLETE = int(os.environ.get('SLEEP_ON_COMPLETE', 10000000))

print 'Querying data from {} to {}...'.format(START_TIME, END_TIME)

BATCH_MINUTES = 15


BASE_QUERY = '''\
SELECT
    lon AS lng,
    lat,
    count(*) AS weight,
    sum(time_total_session - time_in_server) / count(*) AS latency,
    quantile(0.50)(time_total_session - time_in_server) AS latency_p50,
    quantile(0.75)(time_total_session - time_in_server) AS latency_p75,
    quantile(0.90)(time_total_session - time_in_server) AS latency_p90,
    quantile(0.95)(time_total_session - time_in_server) AS latency_p95,
    quantile(0.99)(time_total_session - time_in_server) AS latency_p99,
    quantile(0.999)(time_total_session - time_in_server) AS latency_p999
FROM {{table}}
WHERE (status_code = 200)
  AND NOT ((lat = 38)
  AND (lon = -97))
  AND NOT ((lat = 0) AND (lon = 0))
  AND timestamp >= toDateTime('{{startTime}}')
  AND timestamp < (toDateTime('{{startTime}}') + 60 * {{batchMinutes}})
  {condition}
GROUP BY
    lon,
    lat
INTO OUTFILE '{{outfile}}'
FORMAT CSVWithNames;
'''

AUTH_PAY_CONDITION = '''\
AND (backend_name = 'authserver')
AND is_pay
'''

PAY_CONDITION = '''\
AND is_pay
'''

QUERY = BASE_QUERY.format(condition=AUTH_PAY_CONDITION)


def run():
    cur_date = START_TIME

    while cur_date <= END_TIME:
        print cur_date

        cur_date += timedelta(minutes=BATCH_MINUTES)
        unix = int(time.mktime(cur_date.timetuple()))
        outfile = 'data/batch_{}.csv'.format(unix)

        print outfile

        query = QUERY.format(
            table=TABLE,
            startTime=datetime.strftime(cur_date, CLICKHOUSE_DATE_FORMAT),
            outfile=outfile,
            batchMinutes=BATCH_MINUTES)

        print query

        call(['clickhouse-client',
              '--host', HOST,
              '--database', DATABASE,
              '--query', query])

    print 'Done. Sleeping for {} seconds...'.format(SLEEP_ON_COMPLETE)
    time.sleep(SLEEP_ON_COMPLETE)


if __name__ == '__main__':
    print 'Starting pull.py...'
    run()


# clickhouse-client --host clickhouse1.dev.clover.com --database log --query ""
