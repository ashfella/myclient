# Myclient

Let's install node opcua

```
$ npm init                      # create a package.json
$ npm install node-opcua --save
$ npm install async --save

$ npm install json2csv --save   # converts json into csv
```

> My client installs a subscription and monitors item for 30 seconds. On every change of the data it receives a string sent from server. Each string if not null is converted to json and is saved into file.




