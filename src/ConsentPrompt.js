import React from 'react';
import ConsentPromptForm from './ConsentPromptForm';

class ConsentPrompt extends React.Component {
    render() {
        return(
            <div className="consent-prompt">
                <p>Inspired by anxiety and a random <a href="https://news.ycombinator.com/item?id=25670884"> HackerNews comment</a>,
                this site uses your browser's text-to-speech system to allow you to experience Twitter through the outrageous din of a <a href="https://en.wikipedia.org/wiki/Party_line_(telephony)"> party line.</a></p>
                
                <p>As is any trip to Twitter, this is a loud and stressful experience.</p>
                <p>Are you sure you'd like to proceed?</p>
                <ConsentPromptForm toggleConsent={this.props.toggleConsent}/>
            </div>
        );
    }
}

export default ConsentPrompt;