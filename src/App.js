import React from 'react';
import './App.css';
import TextEditor from "./library/TextEditor";

class App extends React.Component {

    onChange = e => {
        console.log(e.target.value);
    };

    render() {
        return (
            <div className="App">
                <TextEditor
                    width={900}
                    height={900}
                    html={''}
                    onChange={this.onChange}
                />
            </div>
        );
    }

}

export default App;
