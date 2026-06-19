#!/bin/bash
# Generate integration templates for all major ad networks
# Each template is a minimal JSON file — drop into server/templates/traffic-sources/

cd ~/projects/1ai-affiliate/server/templates/traffic-sources

# Push notification networks
cat > richpush.json << 'EOF'
{"id":"richpush","name":"RichPush","icon":"📢","description":"Push notification ad network","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"RichPush"},{"key":"platform_type","type":"hidden","default":"richpush"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > propellerads_push.json << 'EOF'
{"id":"propellerads","name":"PropellerAds","icon":"🌐","description":"Pop, Push, Interstitial ads","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"PropellerAds"},{"key":"platform_type","type":"hidden","default":"propellerads"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPA","CPC"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# Native ad networks
cat > taboola.json << 'EOF'
{"id":"taboola","name":"Taboola","icon":"📰","description":"Native content discovery ads","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Taboola"},{"key":"platform_type","type":"hidden","default":"taboola"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > outbrain.json << 'EOF'
{"id":"outbrain","name":"Outbrain","icon":"🔷","description":"Native advertising platform","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Outbrain"},{"key":"platform_type","type":"hidden","default":"outbrain"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > mgid.json << 'EOF'
{"id":"mgid","name":"MGID","icon":"🟢","description":"Native advertising network","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"MGID"},{"key":"platform_type","type":"hidden","default":"mgid"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# Pop/redirect networks
cat > zeropark.json << 'EOF'
{"id":"zeropark","name":"Zeropark","icon":"⚡","description":"Pop, redirect, push traffic","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Zeropark"},{"key":"platform_type","type":"hidden","default":"zeropark"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > popads.json << 'EOF'
{"id":"popads","name":"PopAds","icon":"💥","description":"Pop-under advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"PopAds"},{"key":"platform_type","type":"hidden","default":"popads"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > popcash.json << 'EOF'
{"id":"popcash","name":"PopCash","icon":"💵","description":"Pop-under network","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"PopCash"},{"key":"platform_type","type":"hidden","default":"popcash"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > hilltopads.json << 'EOF'
{"id":"hilltopads","name":"HilltopAds","icon":"🏔️","description":"Pop & banner ad network","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"HilltopAds"},{"key":"platform_type","type":"hidden","default":"hilltopads"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > adsterra.json << 'EOF'
{"id":"adsterra","name":"Adsterra","icon":"🔺","description":"Pop, social bar, native ads","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Adsterra"},{"key":"platform_type","type":"hidden","default":"adsterra"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# Social/display
cat > snapchat.json << 'EOF'
{"id":"snapchat","name":"Snapchat Ads","icon":"👻","description":"Snapchat advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Snapchat Ads"},{"key":"platform_type","type":"hidden","default":"snapchat"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > twitter_ads.json << 'EOF'
{"id":"twitter","name":"X/Twitter Ads","icon":"🐦","description":"X (Twitter) advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"X Ads"},{"key":"platform_type","type":"hidden","default":"twitter"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > pinterest.json << 'EOF'
{"id":"pinterest","name":"Pinterest Ads","icon":"📌","description":"Pinterest advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Pinterest Ads"},{"key":"platform_type","type":"hidden","default":"pinterest"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > linkedin.json << 'EOF'
{"id":"linkedin","name":"LinkedIn Ads","icon":"💼","description":"LinkedIn advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"LinkedIn Ads"},{"key":"platform_type","type":"hidden","default":"linkedin"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM","CPA"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > reddit.json << 'EOF'
{"id":"reddit","name":"Reddit Ads","icon":"🤖","description":"Reddit advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Reddit Ads"},{"key":"platform_type","type":"hidden","default":"reddit"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

cat > quora.json << 'EOF'
{"id":"quora","name":"Quora Ads","icon":"❓","description":"Quora advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Quora Ads"},{"key":"platform_type","type":"hidden","default":"quora"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPC","CPM"],"default":"CPC"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# Video
cat > youtube_ads.json << 'EOF'
{"id":"youtube","name":"YouTube Ads","icon":"▶️","description":"YouTube video advertising","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"YouTube Ads"},{"key":"platform_type","type":"hidden","default":"youtube"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# DSP / Programmatic
cat > dsp_generic.json << 'EOF'
{"id":"dsp","name":"DSP (Generic)","icon":"🎯","description":"Demand-side platform","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"DSP"},{"key":"platform_type","type":"hidden","default":"dsp"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPC","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"},{"key":"postback_url_template","label":"Postback URL Template","type":"text","placeholder":"https://your-dsp.com/conv?click_id={click_id}"}]}
EOF

# Email
cat > email.json << 'EOF'
{"id":"email","name":"Email Marketing","icon":"📧","description":"Email traffic source","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Email"},{"key":"platform_type","type":"hidden","default":"email"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPA","CPC"],"default":"CPA"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# SEO / Organic
cat > organic.json << 'EOF'
{"id":"organic","name":"Organic / SEO","icon":"🌱","description":"Organic search traffic","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Organic"},{"key":"platform_type","type":"hidden","default":"organic"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPA","revshare"],"default":"CPA"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# Incent
cat > incent.json << 'EOF'
{"id":"incent","name":"Incentivized","icon":"🎁","description":"Incentivized traffic (CPA)","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Incent"},{"key":"platform_type","type":"hidden","default":"incent"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPA","CPI"],"default":"CPA"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# Telegram
cat > telegram_ads.json << 'EOF'
{"id":"telegram","name":"Telegram Ads","icon":"✈️","description":"Telegram channel/group traffic","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"Telegram"},{"key":"platform_type","type":"hidden","default":"telegram"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPM","CPA"],"default":"CPM"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

# WhatsApp
cat > whatsapp.json << 'EOF'
{"id":"whatsapp","name":"WhatsApp","icon":"💬","description":"WhatsApp traffic","fields":[{"key":"name","label":"Source Name","type":"text","required":true,"default":"WhatsApp"},{"key":"platform_type","type":"hidden","default":"whatsapp"},{"key":"cost_model","label":"Cost Model","type":"select","options":["CPA"],"default":"CPA"},{"key":"currency","label":"Currency","type":"text","default":"USD"}]}
EOF

echo "Created $(ls *.json | wc -l) traffic source templates"
