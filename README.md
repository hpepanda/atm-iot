# ATM IoT ImageProcessing
The Image Processing Server responsible for saving images received from Raspberry Pi to the specific directory in the hard drive and for further processing of this images which consists in determining if there are people on the image and if yes then how many them present on the photo. Next, processed image with number of people on it sent to the next server.

## Installation:
+ Clone the source code to the any place on your PC and go to the folder:

    ```
    git clone https://github.com/hpepanda/atm-iot.git && cd atm-iot
    ```
+ Make sure that the "serverimageprocessing" branch is active:

    ```
    git checkout serverimageprocessing && git status
    ```
You should see something like this in the output:

  ![git status results](https://cloud.githubusercontent.com/assets/20835203/17596563/b6064f34-5ffa-11e6-8f76-3a9574217b68.png)

+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Open the package.json file to edit application settings. The most interesting are the following lines:

    ```
    "serverIP": "<IP address of the server>",
    "serverPort": <Server port (8086 by the default)>,
    "accusticPort": <Port that uses the accustic sensor (8084 by the default)>,
    "raspicamPort": <Port that uses the RaspiCam (8085 by the default)>,
    "streamUri": "ws://<IP address of the Raspberry Pi>:8084/",
    "imagePath": "<The name of the saved image and path where it will be saved>",
    ```
5. Start the ImageCleaner server:

    ```
    npm start
    ```
If the server works fine you should see the following output messages:

*Screenshot*
