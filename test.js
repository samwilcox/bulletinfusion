const settings = {
    autoSubscribe: {
        types: {
           postedTo: false,
           replyTo: false, 
        },
        method: 'onNewContent'
    },
    content: {
        notificationList: true,
        email: false,
    }
};

const theSettings = JSON.stringify(settings);
console.log(theSettings);