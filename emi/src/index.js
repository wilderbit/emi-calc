import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class EMIForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            principal: 0,
            rate: 0,
            months: 0,
            success: false,
            data: null,
            error: null,
            isLoaded: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    changeHandler =  (event) => {
        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        event.preventDefault();
        fetch("http://127.0.0.1:8080/calculate_emi/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "amount": 10000000,
                "rate": 8.5,
                "tenure": 12
            }),
        }
        ).then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    success: true,
                    data: result,
                    isLoaded: true,
                })
            },
            (error) => {
                this.setState({
                    success: false,
                    error: error,
                    isLoaded: true,
                })
            }
        )
    }
    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Principal Amount:
                        <input type="text" name="principal" value={this.state.principal} onChange={this.changeHandler}/>
                        <br/>
                        Rate of Interest:
                        <input type="text" name="rate" value={this.state.rate} onChange={this.changeHandler}/>
                        <br/>
                        Number of Month:
                        <input type="text" name="months" value={this.state.months} onChange={this.changeHandler}/>
                        <br/>
                    </label>
                    <input type="submit" value="Submit"/>
                </form>
                <Table state={this.state}/>
            </div>
        )
    }
}

function Table(props) {
    if (props.state.isLoaded) {
        if (props.state.success) {
            const data = props.state.data;
            let rows = data.monthly_data.map((value, index) => {
                return (<li key={index}>
                    {value.amount}, {value.interest}, {value.principal}, {data.emi}, {value.remaining_principal}
                </li>);
            });
            return(<div>
                <h1>Total Amount to be paid: {data.total_emi_amount}</h1>
                <h1>Total Interest to be paid: {data.total_interest}</h1>
                <h1>Total Interest to be paid: {data.emi}</h1>
                <ol>{rows}</ol>
            </div>)
        } else {
            return(<div><h1>Some Error Occurred</h1> </div>)
        }
    } else {
        return(<div></div>)
    }
}


ReactDOM.render(
    <EMIForm/>,
    document.getElementById('root')
);
