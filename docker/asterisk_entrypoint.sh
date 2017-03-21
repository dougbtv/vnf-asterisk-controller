#!/bin/bash

# Check for target interface
echo "TARGET_INTERFACE: $TARGET_INTERFACE"
if [ -z "$TARGET_INTERFACE" ]; then
  echo "You must specify the TARGET_INTERFACE environment variable."
  exit 1
fi

# Check for etcd hostname
if [ -z "$ETCD_HOSTNAME" ]; then
  echo "You must specify the ETCD_HOSTNAME environment variable."
  exit 1
fi

# Get the IP address for the interface
ip_address=$(ip a | grep -Pi -A3 "^\d.+$TARGET_INTERFACE" | grep "inet " | awk '{print $2}' | perl -p -e 's|^(.+)/.+$|$1|')

# Generate a UUID name for this box.
UUID=$(cat /proc/sys/kernel/random/uuid)

# Now announce that IP address to etcd
echo "Announcing IP location to etcd: $ip_address"
curl -s -L -X PUT http://$ETCD_HOSTNAME:2379/v2/keys/asterisk/$UUID/ip -d value="$ip_address"

if [ ! -z "$ADVERTISE_NICKNAME" ]; then
  echo "Announcing nickname to etcd: $ADVERTISE_NICKNAME"
  curl -s -L -X PUT http://$ETCD_HOSTNAME:2379/v2/keys/asterisk/$UUID/nickname -d value="$ADVERTISE_NICKNAME"
fi

asterisk -f