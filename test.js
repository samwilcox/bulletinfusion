// const settings = {
//     autoSubscribe: {
//         types: {
//            postedTo: false,
//            replyTo: false, 
//         },
//         method: 'onNewContent'
//     },
//     content: {
//         notificationList: true,
//         email: false,
//     }
// };

// const theSettings = JSON.stringify(settings);
// console.log(theSettings);

// const poll = {
//     title: 'A test poll',
//     pollOnly: false,
//     doesClose: false,
//     closesAt: null,
//     closed: false,
//     voters: {
//         voted: [],
//         didNotVote: [],
//     },
//     questions: [
//         {
//             number: 1,
//             question: 'Does Trump suck?',
//             multipleChoice: false,
//             options: [
//                 {
//                     title: 'Yes',
//                     totalVotes: 0,
//                 },
//                 {
//                     title: 'No',
//                     totalVotes: 0,
//                 }
//             ]
//         }
//     ]
// };

const ext = {
    show: true,
    max: 5
};

console.log(JSON.stringify(ext));