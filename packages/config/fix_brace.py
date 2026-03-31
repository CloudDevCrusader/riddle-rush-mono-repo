with open("vite.config.ts", "r") as f:
    content = f.read()
    content = content.replace(")} catch {", ")} catch {")
    f.seek(0)
    f.write(content)
