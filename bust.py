# cache-bust: stamp every relative module import (and index.html) with one version tag so a deploy refreshes the whole graph
import re, glob, sys
tag = sys.argv[1]
for f in glob.glob('js/*.js'):
    s = open(f).read()
    n = re.sub(r"((?:from|import)\s+'\./[A-Za-z0-9_]+\.js)(\?v=[^']*)?'", lambda m: m.group(1) + "?v=" + tag + "'", s)
    if n != s: open(f, 'w').write(n)
s = open('index.html').read()
s = re.sub(r"\?v=[0-9a-z]+", "?v=" + tag, s)
open('index.html', 'w').write(s)
