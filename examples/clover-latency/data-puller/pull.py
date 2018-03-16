#!/usr/bin/env python

import time
from subprocess import call


HOST = 'clickhouse1.dev.clover.com'
DATABASE = 'log'
QUERY = '''\
SELECT
  lon,
  lat,
  count(*),
  sum(time_total_session - time_in_server) / count(*) AS latency_mean,
  quantile(.5)(time_total_session - time_in_server) AS latency_p50,
  quantile(.75)(time_total_session - time_in_server) AS latency_p75,
  quantile(.9)(time_total_session - time_in_server) AS latency_p90,
  quantile(.95)(time_total_session - time_in_server) AS latency_p95,
  quantile(.99)(time_total_session - time_in_server) AS latency_p99,
  quantile(.999)(time_total_session - time_in_server) AS latency_p999
FROM haproxy_log2
WHERE timestamp > now() - (60 * {lookback_mins})
  AND backend_name = 'authserver'
GROUP BY client_ip, lon, lat
INTO OUTFILE '{outfile}' FORMAT CSV
'''


def run():
    while True:
        t = int(time.time())
        print 't={}'.format(t)
        query = QUERY.format(lookback_mins=1, outfile='test{}.csv'.format(t))

        call(['clickhouse-client',
              '--host', HOST,
              '--database', DATABASE,
              '--query', query])
        time.sleep(1)


if __name__ == '__main__':
    print 'Starting pull.py...'
    run()


# clickhouse-client --host clickhouse1.dev.clover.com --database log --query ""
