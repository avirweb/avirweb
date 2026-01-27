#!/bin/bash

# List of form files to update
FORM_FILES=(
  "site/careers/assistant-technician.html"
  "site/careers/integration-technician.html"
  "site/commercial-form.html"
  "site/index.html"
  "site/residential-form.html"
  "site/service-request.html"
)

cd /home/agent/avir

for file in "${FORM_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Replace method="get" with method="post" action="/api/submit-form"
    sed -i 's/method="get"/method="post" action="\/api\/submit-form"/' "$file"
    
    # Add form-type hidden field if homepage form
    if [[ "$file" == *"index.html" ]]; then
      sed -i 's/<form id="email-form"/<form id="email-form">\n      <input type="hidden" name="form-type" value="homepage">/' "$file"
    elif [[ "$file" == *"commercial-form"* ]]; then
      sed -i 's/<form /<form >\n      <input type="hidden" name="form-type" value="commercial">/' "$file"
    elif [[ "$file" == *"residential-form"* ]]; then
      sed -i 's/<form /<form >\n      <input type="hidden" name="form-type" value="residential">/' "$file"
    elif [[ "$file" == *"service-request"* ]]; then
      sed -i 's/<form /<form >\n      <input type="hidden" name="form-type" value="service">/' "$file"
    elif [[ "$file" == *"career"* ]]; then
      sed -i 's/<form /<form >\n      <input type="hidden" name="form-type" value="career">/' "$file"
    fi
    
    echo "  ✓ Done"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo ""
echo "All forms updated successfully!"
