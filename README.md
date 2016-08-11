# ATM IoT ImageCleaner
While working the IoT system saves all images made by RaspiCam on the server. If the system will work long time there can be a lot of images stored on the server. To prevent memory overflow was created the ImageCleaner server. It's only mission is to delete images from a specific directory on the server with established interval.

## Installation:
+ Clone the source code to the any place on your PC and go to the folder:

    ```
    git clone https://github.com/hpepanda/atm-iot.git && cd atm-iot
    ```
+ Make sure that the "imagecleaner" branch is active:

    ```
    git checkout imagecleaner && git status
    ```
You should see something like this in the output:

   ![git status results](https://cloud.githubusercontent.com/assets/20835203/17593683/62cb67ce-5fef-11e6-8db2-7e83bbfaa14a.png)
   
+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Open the package.json file to edit application settings. The most interesting are the following lines:

    ```
    "dir": "<Path to the folder with saved images>",
    "interval": <Time interval>,
    "serverIP": "<IP address of the server>",
    "serverPort": <Server port (8060 by the default)>
    ```
+ Start the ImageCleaner server:

    ```
    npm start
    ```
If the server works fine you should see the following output messages:

*Screenshot*
