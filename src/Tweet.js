import React from 'react';
import './Tweet.css';
class Tweet extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            display: '',
        };

        // mounting
        this.sliceString = this.sliceString.bind(this);
        this.getRandomVoice = this.getRandomVoice.bind(this);
        this.filterMessage = this.filterMessage.bind(this);
    }

    sliceString(partialString) {
        return (partialString.length === this.props.content.length) ? partialString : this.props.content.slice(0, partialString.length + 1);
    }

    getRandomVoice() {
        // return a random english speaking voice
        let voices = window.speechSynthesis.getVoices().filter(voice => (voice.lang.includes('en')));
        return voices[Math.floor(Math.random() * voices.length)]
    }

    filterMessage(message) {        
        // remove any urls
        message = message.toString().replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

        // TODO? remove emojis? 
        return message
    }

    componentDidMount() {
        // Speak
        var msg = new SpeechSynthesisUtterance();
        msg.text = this.filterMessage(this.props.content);  // don't read URLs
        msg.onend = () => this.props.addTweet();
        msg.rate = this.props.displayRate;
        // msg.voice = this.getRandomVoice();
        this.setState({voice: msg.voice});
        window.speechSynthesis.speak(msg);
        
        // higher speechRate == longer display time; 
        let calculateSpeechRate = () => 40 - (10*this.props.displayRate);
        let speechRate = calculateSpeechRate() > 0 ? calculateSpeechRate() : 1
        this.interval = setInterval(() => this.setState({ display: this.sliceString(this.state.display) }), speechRate);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return(
            <div class='tweet-wrapper'>
                {this.state.display}
            </div>
        );
    }
}

export default Tweet;