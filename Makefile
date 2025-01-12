build:
	rm -f extension.zip
	zip extension.zip LICENSE *.css *.js *.json *.html

deploy:
	open https://chrome.google.com/webstore/developer/dashboard
	open https://addons.mozilla.org/en-US/developers/addons

default: build
