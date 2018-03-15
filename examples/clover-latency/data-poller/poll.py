#!/usr/bin/env python

import time


def run():
  while True:
    print time.time()
    time.sleep(5)


if __name__ == '__main__':
  print 'here'
  run()

# clickhouse-client --host clickhouse1.dev.clover.com --database log --query "select * from haproxy_log into outfile 'test.csv' format CSV"
