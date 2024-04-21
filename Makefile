build:
	zip extension.zip LICENSE *.css *.js *.json *.html

deploy:
	open https://chrome.google.com/webstore/developer/dashboard

default: build
