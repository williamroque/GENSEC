rm bench.txt

for i in {1..$1}
do
    echo
    gtime --output=bench.txt -a --format="%E" python3 client.py>/dev/null
    echo "== $i ==" >> bench.txt
    tail -2 bench.txt
done

echo

python3 avg.py

echo
