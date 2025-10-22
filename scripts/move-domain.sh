#!/bin/bash

# Move web.one.ie from one-web to web project

ACCOUNT_ID="627e0c7ccbe735a4a7cabf91e377bbad"
DOMAIN="web.one.ie"
OLD_PROJECT="one-web"
NEW_PROJECT="web"

echo "Moving $DOMAIN from $OLD_PROJECT to $NEW_PROJECT..."

# You'll need to run these manually or set CLOUDFLARE_API_TOKEN
# 1. Remove from one-web
echo "To remove from $OLD_PROJECT:"
echo "curl -X DELETE \"https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$OLD_PROJECT/domains/$DOMAIN\" \\"
echo "  -H \"Authorization: Bearer \$CLOUDFLARE_API_TOKEN\""

echo ""

# 2. Add to web
echo "To add to $NEW_PROJECT:"
echo "curl -X POST \"https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$NEW_PROJECT/domains\" \\"
echo "  -H \"Authorization: Bearer \$CLOUDFLARE_API_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  --data '{\"name\":\"$DOMAIN\"}'"
