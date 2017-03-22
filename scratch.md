## It's Doug's scratch pad!

He needs these to try out stuff, and keep his thoughts straight.

## Connecting two instances.


## example pjsip.conf 

based on docker-asterisk sample.

```
[transport-udp]
type = transport
protocol = udp
bind = 0.0.0.0

[asterisk1]
type = aor
contact = sip:asterisk1@127.0.0.1:5061

[asterisk1]
type = identify
endpoint = asterisk1
match = 127.0.0.1

[asterisk1]
type = endpoint
context = inbound
disallow = all
allow = ulaw
rtp_symmetric = yes
force_rport = yes
rewrite_contact = yes
from_user = asterisk1
aors = asterisk1

[asterisk2]
type = aor
contact = sip:asterisk2@127.0.0.1:5062

[asterisk2]
type = identify
endpoint = asterisk2
match = 127.0.0.1

[asterisk2]
type = endpoint
context = inbound
disallow = all
allow = ulaw
rtp_symmetric = yes
force_rport = yes
rewrite_contact = yes
from_user = asterisk2
aors = asterisk2

```