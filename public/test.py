from collections import Counter

def change_calls(function_calls, txt):
	changed_txt = ""
	counter = dict(Counter(function_calls))
	print(txt, counter)
	for fc in counter.keys():
		for i in range(0,counter[fc]):
			sl = txt.split(fc)
			test = "{}".format(fc)
			changed_txt = test.join(sl[:i+1]) + "aio.run("# + fc +'('

			nb_par = 1
			closed = False
			
			for s in sl[i+1:]:
				changed_txt+=fc
				for c in s:			
					if c == '(': nb_par += 1
					if c == ')': nb_par -= 1
					changed_txt += c
					if nb_par == 0 and not closed:
						closed = True
						changed_txt += ')'
			txt = changed_txt 
	return txt

t1=change_calls(['example(', 'example('], "print(example(1)+example(2))")
t2=change_calls(['example1(', 'example2(', 'example3','example1('],"example1(1)+example2(2)+example1(3)*example3()")
t3=change_calls(['example1(', 'example2(','example1(','example1('],"example1(example2(2))+example1(example1())")
print("--")
print(t1)
print(t2)
print(t3)