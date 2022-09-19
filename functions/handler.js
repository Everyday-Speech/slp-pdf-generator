const { writeFileSync } = require("fs");
const { DiceRollerPDF } = require('./dice-roller-pdf');
const { FlashcardPDF } = require('./flashcard-pdf');
const aws = require("aws-sdk");
const s3 = new aws.S3({ region: "us-east-1" });

const getSingedUrl = async(
    bucketName,
    keyName) => {
    const params = {
        Bucket: bucketName,
        Key: keyName,
        Expires: 60 * 5
    };

    try {
        const url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', params, (err, url) => {
                err ? reject(err) : resolve(url);
            });
        });
        console.log(url)
    } catch (err) {
        if (err) {
            console.log(err)
        }
    }
}



const saveToS3 = (
    bucketName,
    keyName,
    Body
) => {
    return new Promise((resolve, reject) => {

        s3.putObject({
            Bucket: bucketName,
            Key: keyName,
            ACL: "public-read",
            Body
        }, (error, data) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.diceroller = async() => {

    const worksheet = {
        "title": "Tone of Voice",
        "description": "Tone of voice is not what we say, but how we say something. Learning to pick-up on the differences between someone’s tone of voice helps us to know how they’re feeling and what their intended message is.",
        "instruction": [
            "Actors take turns rolling the dice to reveal a line and tone of voice. Make sure no other group members can see the dice.",
            "Actors will say their given line using the indicated tone of voice.",
            "Group members take turns guessing how the actor is feeling and what their intended message is."
        ],
        "cards": [{
                "side": 1,
                "prompt": "“What’s wrong?” (concerned)",
                "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1642591534/games/world_c3_assets/emojis/face_Concerned.png"
            },
            {
                "side": 2,
                "prompt": "“Can you move over?” (rude)",
                "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1642591533/games/world_c3_assets/emojis/face_Angry.png"
            },
            {
                "side": 3,
                "prompt": "“You’re so funny!” (sarcastic)",
                "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1624466952/interactive_activities/MTCH%20W289/W289_MTCH_3L_image.png"
            },
            {
                "side": 4,
                "prompt": "“What’s wrong?” (annoyed)",
                "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1642591533/games/world_c3_assets/emojis/face_Annoyed.png"
            },
            {
                "side": 5,
                "prompt": "“Can you move over?” (polite)",
                "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1642591536/games/world_c3_assets/emojis/face_Happy.png"
            },
            {
                "side": 6,
                "prompt": "“You’re so funny!” (kind)",
                "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1642591536/games/world_c3_assets/emojis/face_Happy.png"
            }
        ]
    };

    const pdf = await DiceRollerPDF().createPDF(worksheet);

    // writeFileSync("test.pdf", pdf);
    const buffer = Buffer.from(pdf);

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/pdf",
        },
        body: buffer.toString("base64"),
        isBase64Encoded: true,
    };

};


module.exports.flashcard = async() => {

    const worksheet = {
        "title": "ACTIVITY TITLE BLANK SPACE (60 CHARACTERS) LETS FILL WITH IT",
        "description": "When our teacher is talking, we should always listen. If we don’t listen we could miss important instructions or information.  Lets fill it with one hundredeighty characters try it",
        "cards": [{
                "front": {
                    "title": "Look at the picture, what does the images ",
                    "text": "At quisque morbi quis magna vitae facilisis massa consectetur sed? Do you prefer to eat pancakes or waffles?",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1565139894/stagingimage/gm23ehykjxgpvpmopjbf.png"
                },
                "back": {
                    "title": "Which octopus looked the happiest? Why doo",
                    "text": "At quisque morbi quis magna vitae facilisis massa consectetur sed? Do you prefer to eat pancakes or waffles?",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 2",
                    "text": "waiting your turn 2",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 2",
                    "text": "waiting your turn 2"
                }
            },
            {
                "front": {
                    "title": "Superflex 3",
                    "text": "waiting your turn 3",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "text": "waiting your turn 3"
                }
            },
            {
                "front": {
                    "title": "Superflex 4",
                    "text": "waiting your turn 4",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 4",
                    "text": "waiting your turn 4",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 5",
                    "text": "waiting your turn 5",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 5",
                    "text": "waiting your turn 5",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 6",
                    "text": "waiting your turn 6",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 6",
                    "text": "waiting your turn 6",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 7",
                    "text": "waiting your turn 7",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 7",
                    "text": "waiting your turn 7",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 8",
                    "text": "waiting your turn 8",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 8",
                    "text": "waiting your turn 8",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 9",
                    "text": "waiting your turn 9",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 9",
                    "text": "waiting your turn 9",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            },
            {
                "front": {
                    "title": "Superflex 10",
                    "text": "waiting your turn 10",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564014839/staging_image/zudn0mqz5skxyyfhlovf.png"
                },
                "back": {
                    "title": "Superflex 10",
                    "text": "waiting your turn 10",
                    "imageURL": "https://res.cloudinary.com/everyday-speech/image/upload/v1564064023/staging_image/ucrmyf3zumpmigbjkb1a.png"
                }
            }
        ]
    };

    const pdfDoc = await FlashcardPDF().createPDF(worksheet);
    // const buffer = Buffer.from(pdf);

    // // writeFileSync("test.pdf", pdf);


    // return {
    //     statusCode: 200,
    //     headers: {
    //         "Content-Type": "application/pdf",
    //     },
    //     body: buffer.toString("base64"),
    //     isBase64Encoded: true,
    // };

    const bucketName = "ws-pdf-generator"
    const keyName = "flashcard.pdf"

    const data = await pdfDoc.saveAsBase64();

    await saveToS3(
        bucketName,
        keyName,
        Buffer(data, "base64")
    );

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/html",
        },
        body: "https://" + bucketName + ".s3.amazonaws.com/" + keyName,
    };

};