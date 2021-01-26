import React from 'react';
import ConsentPrompt from './ConsentPrompt';
import Tweet from './Tweet';
import './PartyLine.css';

class PartyLine extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            consented: false,
            tweetsBuffering: false, // currently loading tweets to buffer
            tweetsBuffered: false,  // have loaded tweets to buffer
            tweetOffset: 0,
            tweetBuffer: [],
            loadedTweets: [],
            currentRate: 1,
        };

        this.determineDisplay = this.determineDisplay.bind(this);
        this.toggleConsent = this.toggleConsent.bind(this);
        this.getTweets = this.getTweets.bind(this);
        this.resetTweetOffset = this.resetTweetOffset.bind(this);
        this.loadTweet = this.loadTweet.bind(this);
    }

    componentDidMount() {
        var synth = window.speechSynthesis;
        this.setState({synth: synth})
        if (!this.state.tweetsBuffered && !this.state.tweetsBuffering) {
            this.setState({tweetsBuffering: true});
            this.getTweets();
        }
    }

    loadTweet(){
        // if buffer near empty, refill with new tweets
        if(this.state.tweetBuffer.length <= 10 && this.state.tweetsBuffered){
            this.getTweets();
        }

        // remove a random tweet from the buffer and load into loadedTweets w/ current rate
        let randomIndex = Math.floor(Math.random() * this.state.tweetBuffer.length)
        let cachedTweet = this.state.tweetBuffer[randomIndex];
        cachedTweet.displayRate = this.state.currentRate;

        this.setState({
             loadedTweets: [...this.state.loadedTweets, cachedTweet],
             tweetBuffer: [...this.state.tweetBuffer.filter(tweet => tweet.id !== cachedTweet.id)]
        });

        // increment rate if not yet at maximum
        if(this.state.currentRate < 5) {
            this.setState({currentRate: this.state.currentRate + 0.15});
        }
    }

    resetTweetOffset(){
        // called when no more tweets received from backend
        this.setState({tweetOffset: 0});
        this.getTweets();
    }

    getTweets(callback) {
        let url = `https://twitter-partyline.herokuapp.com/tweets/?offset=${this.state.tweetOffset}&limit=250`
        fetch(url)
            .then(response => response.json())
            // if no more tweets received from backend, set offset to 0 and call getTweets() again
            // else continue loading tweets
            .then(data => (data.tweets.length === 0 ?
                this.resetTweetOffset() : 
                this.setState({
                    tweetBuffer: [...this.state.tweetBuffer, ...data.tweets],
                    tweetOffset: this.state.tweetOffset + 250, // increment offset
                    tweetsBuffered: true,  // track state
                    tweetsBuffering: false,
                }))
            )
    }
    
    toggleConsent() {
        // to pass down to ConsentPrompt
        let inverseConsent = !this.state.consented;
        this.setState({...this.state, consented: inverseConsent});
        this.loadTweet()  // kick off first tweet
    }

    mapTweets() {
        return this.state.loadedTweets.map(tweet => (<Tweet 
                content={tweet.content} 
                key={tweet.id}
                displayRate={tweet.displayRate}
                addTweet={this.loadTweet}/>
            )
        )
    }
    determineDisplay() {
        if (!this.state.consented) {
            return (
                <div className="content-container-wrapper">
                    <div className="content-container">
                        <ConsentPrompt toggleConsent={this.toggleConsent}/>
                    </div>
                </div>
            );
        } else if (this.state.loadedTweets.length === 0) {
            return (
                <div className="content-container-wrapper">
                <div className="content-container">
                    <p>The line is pretty quiet... Maybe something went wrong?</p>
                </div>
                </div>
            );
        } else {
            return (
                <div className="tweets-container">
                    {this.mapTweets()}
                </div>
            )
        }
    }

    render() {
        let currentState = this.determineDisplay();
        return(
            <div className="generic-container">
                {currentState}
            </div>
        );
    }
}

export default PartyLine;