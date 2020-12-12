from browser import document, alert, window
				import sys 
				class RedirectOutput:
					def __init__(self, textarea):
						self.console = document[textarea]
					
					def write(self, text):
						self.console.text += text 
				sys.stdout = RedirectOutput("output")

				def convert(og_txt):
					hl_dict = {}
					converted_script = ""
					for i,l in enumerate(og_txt.split("\n")):
						hl_dict[i] = l

					converted_script += ("hl_dict = {\n")
					all_keys = list(hl_dict.keys())
					for k in all_keys:
						converted_script += ("{} : \"{}\"".format(k, hl_dict[k].strip('\n').replace("\"", "\\\"")))
						if k != all_keys[-1]:
							converted_script += (",\n")
					converted_script += ("}\n")

					# for i,l in enumerate(og_txt.split("\n")):
					# 	header = ""
					# 	for c in hl_dict[i]:
					# 		if c == '\t': header += "\t"
					# 		if c == " ": header += " "
					# 		else: break
					# 	converted_script += header+("document[\"output\"].innerHTML+=(\"Executing:\" + hl_dict[{}])\n".format(i))
					# 	converted_script += header+ "document[\"output\"].innerHTML += \"\\n\" \n"
					# 	if "change_button" in l :
					# 		converted_script += header+("document[\"run_button\"].value = \"HAHAHAHA\"" + "\n")
					# 	else:
					# 		converted_script += (l+"\n")
					
					return converted_script


				def callScript(event):
					py_obj = document.querySelector(".CodeMirror").CodeMirror
					code = py_obj.getValue()
					code2 = convert(code)
					document["output"].innerHTML = ""
					#print(code2)
					exec(code2)

				document["run_button"].bind("click", callScript)