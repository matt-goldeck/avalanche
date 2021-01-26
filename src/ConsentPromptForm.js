import React from 'react';

class ConsentPromptForm extends React.Component {
    constructor(props){
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(evt) {
        evt.preventDefault();
        this.props.toggleConsent();
    }

    render() {
        return(
            <div>
                <form action="https://www.google.com">
                    <div>
                        <button onClick={this.handleSubmit}>Dial me in, operator</button>
                        <button type="submit" href="www.google.com">No thanks</button>
                    </div>
                </form>
            </div>
        );
    }
}

export default ConsentPromptForm;