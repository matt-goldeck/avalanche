import React from 'react';
import ConsentPrompt from './ConsentPrompt';
import Tweet from './Tweet';
import './PartyLine.css';

class PartyLine extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            consented: false,
            tweetsBuffered: false,  // have loaded tweets to buffer
            tweetsLoaded: false,
            tweetOffset: 0,
            tweetBuffer: [],
            loadedTweets: [],
            currentRate: 1,
            requestRetries: 0,
            errorState: false,
        };

        this.determineDisplay = this.determineDisplay.bind(this);
        this.toggleConsent = this.toggleConsent.bind(this);
        this.getTweets = this.getTweets.bind(this);
        this.resetTweetOffset = this.resetTweetOffset.bind(this);
        this.loadTweet = this.loadTweet.bind(this);
        this.bufferTweets = this.bufferTweets.bind(this);
        this.listenForBufferToLoad = this.listenForBufferToLoad.bind(this);
    }

    componentDidMount() {
        if (!this.state.tweetsBuffered) {
            this.bufferTweets();
        }
    }

    loadTweet() {
        // don't try to load a tweet if we've broken something
        if(this.state.errorState || this.state.tweetBuffer.length === 0) {
            this.setState({errorState: true});
            return
        }

        // if buffer near empty and we've buffered before, refill buffer with new tweets
        if(this.state.tweetBuffer.length <= 10 && this.state.tweetsBuffered && !this.state.refillngTweets){
            this.setState({refillngTweets: true});
            this.bufferTweets();
        }

        // remove a random tweet from the buffer and load into loadedTweets w/ current rate
        let randomIndex = Math.floor(Math.random() * this.state.tweetBuffer.length)
        let cachedTweet = this.state.tweetBuffer[randomIndex];
        cachedTweet.displayRate = this.state.currentRate;

        this.setState({
            loadedTweets: [...this.state.loadedTweets, cachedTweet],
            tweetBuffer: [...this.state.tweetBuffer.filter(tweet => tweet.id !== cachedTweet.id)],
            tweetsLoaded: true,
            }
        );

        // increment rate if not yet at maximum
        if(this.state.currentRate < 5) {
            this.setState({currentRate: this.state.currentRate + 0.15});
        }
    }

    resetTweetOffset(){
        // called when no more tweets received from backend
        this.setState({tweetOffset: 0});
        this.bufferTweets();
    }

    getTweets() {
        const maxRequestRetries = 10;
        fetch(`https://twitter-partyline.herokuapp.com/tweets/?offset=${this.state.tweetOffset}&limit=250`)
        .then(response => response.json())
        .then(data => data.tweets.length === 0 ?
            this.resetTweetOffset() : 
            this.setState({tweetBuffer: [...this.state.tweetBuffer, ...data.tweets]}))
        .catch(error => {
            // reset flags and offset on error
            this.setState({
                tweetOffset: this.state.tweetOffset-250,
                requestRetries: this.state.requestRetries + 1,
                tweetsBuffered: this.state.tweetBuffer.length > 0 ? true : false});  // dont reset this flag if we actually have tweets buffered
            this.state.requestRetries <= maxRequestRetries ? 
                setTimeout(() => this.bufferTweets(), 2000) // try again in two seconds if error
                : this.setState({errorState: true})  // give up if tried 10 times
         });
    }

    bufferTweets() {
        this.getTweets();
        this.setState({
            tweetOffset: this.state.tweetOffset + 250,
            tweetsBuffered: true,
            refillngTweets: false, 
        });
        
        if(!this.state.tweetsLoaded) {
            this.listenForBufferToLoad(0);  // kick off first tweet load
        }
    }   

    listenForBufferToLoad(retries) {
        // sometimes tweets can take a long time to load onto buffer, or bufferTweets() might be running into network issues
        // keep trying to load a tweet until hit max retries
        const maxRetries = 5;
        if(this.state.tweetsBuffered && this.state.tweetBuffer.length > 0) {
            this.loadTweet();  // kick off first tweet
        } else if(retries > maxRetries) {
            return
        } else {
            setTimeout(() => this.listenForBufferToLoad(retries + 1), 2000);  // retry in 2 secs if not yet buffered 
        }
    }

    toggleConsent() {
        // to pass down to ConsentPrompt
        let inverseConsent = !this.state.consented;
        this.setState({consented: inverseConsent});
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
        } else if (this.state.errorState) {
            return (
                <div className="content-container-wrapper">
                    <div className="content-container">
                        <p>The line's been cut! <a href="www.matthewgoldeck.com">Matt</a> probably broke something!</p>
                    </div>
                </div>
            );
        } else if (!this.state.tweetsLoaded) {
            return (
                <div className="content-container-wrapper">
                    <div className="content-container">
                        <p>The line is pretty quiet, lets wait and see if something happens...</p>
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