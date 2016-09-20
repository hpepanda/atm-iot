# ATM IoT DataProcessing 
In the current branch you can find a several server-side applications that responsible for saving and processing of the data that received from hardware part of the system (readings from various sensors, photos and videos from cameras etc.). Also, you can find here the software simulator ("AtmEmulator" folder) that can emulate the data stream similar to the one that is sent from the IoT hardware. You can use this simulator for testing purposes or as the replacing of the real hardware based on Rasperry Pi and different sensors connected to it.

## Prerequirements:
Before starting the installation of the data processing software, please check that you installed and configured the additional software:
+ [Git](https://git-scm.com/download/) and [node.js](https://nodejs.org/en/download/)
+ [MongoDB](https://www.mongodb.org/downloads/) (should be [configured](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#configure-a-windows-service-for-mongodb-community-edition/) it as a Windows service)
+ [Python 2.7](https://www.python.org/downloads/) and the latest version of [Erlang](https://www.erlang.org/downloads/) (for RabbitMQ)
+ [Visual C++ Redistributable](https://www.microsoft.com/en-us/download/details.aspx?id=48145) package (for compilation of C++ code)
+ [RabbitMQ Server](https://www.rabbitmq.com/download.html) (applications tested with RabbitMQ version 3.5.5)
+ [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
+ [Gulp](https://www.npmjs.com/package/gulp) (should be installed globally)

## Installation:
+ Clone the source code to the any place on your PC and go to the folder:

    ```
    git clone https://github.com/hpepanda/atm-iot.git && cd atm-iot
    ```
+ Make sure that the "dataprocessing" branch is active:

    ```
    git checkout dataprocessing && git status
    ```
You should see something like this in the output:

  ![Git status results](https://cloud.githubusercontent.com/assets/20835203/17736635/9c6ac60e-6491-11e6-8ac2-9fd638a38c38.png)

### LocalAggregationServer
+ Go to the "LocalAggregationServer" folder

    ```
    cd /d LocalAggregationServer
    ```
+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Go to the "/config" folder and open the  "localConfig.js" file to edit application settings. The most interesting are the following lines:

    ```
    mongodbUri: process.env.MONGODB_URL || "mongodb://<Address of the MongoDB server and its port if needed>/<Name of the DB>",
    rabbitMqHost: process.env.RABBITMQ_URL || "amqp://<Address of the RabbitMQ server and its port if needed>"
    ```
Also, if you are using Stackato platform to run the server, then you can edit the settings through the environment variables by listing them in the "env" section of the "manifest.yml" file that located in the server's root folder:

  ![Environment variables listed in the "manifest.yml" file](https://cloud.githubusercontent.com/assets/20835203/18095010/40af50ee-6ede-11e6-8a28-a6947dc3c397.png)

+ Go to the server's root folder and run it (you can use [pm2](https://www.npmjs.com/package/pm2) tool if you don't want to run every single server in the new cmd window):

    ```
    cd .. && npm start
    ```
If the server works fine you should see the following output messages:

*Screenshot*

### LocalIoTServer
+ Go to the "LocalIoTServer" folder

    ```
    cd /d LocalIoTServer
    ```
+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Open the "server.js" file to edit application settings. The only thing that you can change is the address of the MongoDB server (row 36):

    ```
    mongoose.connect(process.env.MONGODB_URL || "mongodb://<Address of the MongoDB server and its port if needed>/<Name of the db>", options);
    ```
Also, if you are using Stackato platform to run the server, then you can edit the settings through the environment variables by listing it in the "env" section of the "manifest.yml" file that located in the server's root folder:

  ![Environment variable listed in the "manifest.yml" file](https://cloud.githubusercontent.com/assets/20835203/18095035/506bff0a-6ede-11e6-9dc9-d16b543176e3.png)

+ Run the application (you can use [pm2](https://www.npmjs.com/package/pm2) tool if you don't want to run every single server in the new cmd window):

    ```
    npm start
    ```
If the server works fine you should see the following output messages:

*Screenshot*

### LocalRestApiServer
+ Go to the "LocalRestApiServer" folder

    ```
    cd /d LocalRestApiServer
    ```
+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Go to the "/config" folder and open the  "localConfig.js" file to edit application settings. The most interesting are the following lines:

    ```
    mongodbUri: process.env.MONGODB_URL || "mongodb://<Address of the MongoDB server and its port if needed>/<Name of the db>",
    rabbitMqHost: process.env.RABBITMQ_URL || "amqp://<Address of the RabbitMQ server and its port if needed>"
    ```
Also, if you are using Stackato platform to run the server, then you can edit the settings through the environment variables by listing them in the "env" section of the "manifest.yml" file that located in the server's root folder:

  ![Environment variables listed in the "manifest.yml" file](https://cloud.githubusercontent.com/assets/20835203/18095050/5b30853c-6ede-11e6-8c0b-57e1649daf55.png)

+ Go to the server's root folder and run it (you can use [pm2](https://www.npmjs.com/package/pm2) tool if you don't want to run every single server in the new cmd window):

    ```
    cd ../.. && npm start
    ```
If the server works fine you should see the following output messages:

*Screenshot*

### AtmEmulator
+ Go to the "AtmEmulator" folder

    ```
    cd /d AtmEmulator
    ```
+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Go to the "/config" folder and open the "localConfig.js" file to edit application settings. The most interesting are the following lines:

    ```
    binaryServerUri: "http://<Address of the Binary server and its port if needed>/analytics",
    videoServer: "http://<Address of the Video server and its port if needed>"
    ```
Also, if you are using Stackato platform to run the simulator then you can edit the settings through the environment variables listed in the "manifest.yml" file that located in the root folder. You need to edit the following lines:

    ```
    BINARY_SERVER_URI: "http://<Address of the Binary server and its port if needed>/analytics",
    VIDEO_SERVER_URI: "http://<Address of the Video server and its port if needed>"
    ```
+ Go to the root folder and run the application:

    ```
    cd ../.. && npm start
    ```
If the server works fine you should see the following output messages in the console:

*Screenshot*

+ Go to the "/public" folder and open the "index.html" file using web-browser:

  ![Control elements](https://cloud.githubusercontent.com/assets/20835203/18096521/25bc7082-6ee3-11e6-94f5-6f1e01fb84ed.png)

+ Using the control elements you can:
