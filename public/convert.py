import sys 





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

    for i,l in enumerate(f.readlines()):
        print("tt")
        converted_script += ("print(\"Executing:\" + hl_dict[{}])\n".format(i))
        converted_script += (l)
        
    return converted_script

        

            
