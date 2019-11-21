import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function FieldError(props) {
    return(<div className="error">{props.error}</div>)
}

class EMIForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showPrincipalError: [],
            showRateError: [],
            showMonthsError: [],
            principal: "",
            rate: "",
            months: "",
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
    };

    inputOnClick = () => {
        this.setState({
            showPrincipalError: [],
            showRateError: [],
            showMonthsError: [],
        });
    };

    handleSubmit(event) {
        event.preventDefault();
        const principal = this.state.principal;
        const rate = this.state.rate;
        const months = this.state.months;

        if (principal === "" || isNaN(principal)) {
            this.setState({
                showPrincipalError: [<FieldError error="Please enter a valid principal amount" />]
            });
            return;
        }

        if (rate === "" || isNaN(rate)) {
            this.setState({
                showRateError: [<FieldError error="Please enter a valid rate of interest" />]
            });
            return;
        }

        if (months === "" || isNaN(months)) {
            this.setState({
                showMonthsError: [<FieldError error="Please enter a valid number of months" />]
            });
            return;
        }

        const months_int = parseInt(months, 10);
        const amount = Number.parseFloat(principal);
        const interest = Number.parseFloat(rate);

        if (!Number.isInteger(months_int)) {
            this.setState({
                showMonthsError: [<FieldError error="Please enter months as valid integer" />]
            });
            return;
        }

        if( amount <= 0 ) {
            this.setState({
                showPrincipalError: [<FieldError error="Please enter principal greater than zero" />]
            });
            return;
        }

        if( interest <= 0 ) {
            this.setState({
                showRateError: [<FieldError error="Interest rate should be greater than zero" />]
            });
            return;
        }

        if( months_int <= 0 || months_int > 1200) {
            this.setState({
                showMonthsError: [<FieldError error="Months should be in range between 1 and 1200" />]
            });
            return;
        }


        fetch("/calculate_emi/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "amount": amount,
                "rate": interest,
                "tenure": months_int,
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
        );
    }

    render() {
        return (
            <div>
                <div>
                    <form className="form" onSubmit={this.handleSubmit} method="POST">
                        <label className="label">Principal Amount:</label>
                        <input className="input" type="text" name="principal" value={this.state.principal} onChange={this.changeHandler} onClick={this.inputOnClick}/>
                        <div id="principal_error">{this.state.showPrincipalError}</div>
                        <label className="label">Rate of Interest:</label>
                        <input className="input" type="text" name="rate" value={this.state.rate} onChange={this.changeHandler} onClick={this.inputOnClick}/>
                        <div id="rate_error">{this.state.showRateError}</div>
                        <label className="label">Number of Months:</label>
                        <input className="input" type="text" name="months" value={this.state.months} onChange={this.changeHandler} onClick={this.inputOnClick}/>
                        <div id="months_error">{this.state.showMonthsError}</div>
                        <input className="input" type="submit" value="Submit"/><br/>
                    </form>
                </div>
                <div>
                    <Table state={this.state}/>
                </div>
            </div>
        )
    }
}

function Table(props) {
    if (props.state.isLoaded) {
        if (props.state.success) {
            const data = props.state.data;
            let rows = data.monthly_data.map((value, index) => {
                return (<tr className="tr">
                    <td className="td">{value.sno}</td>
                    <td className="td">{value.amount}</td>
                    <td className="td">{data.emi}</td>
                    <td className="td">{value.interest}</td>
                    <td className="td">{value.principal}</td>
                    <td className="td">{value.remaining_principal}</td>
                </tr>);
            });
            return(
                <div>
                    <div className="info">
                        <lable className="info-label">Interest Payable: {data.total_interest}</lable>
                        <lable className="info-label">Total Amount Payable: {data.total_emi_amount}</lable>

                    </div>
                <div className="table-responsive table-content">
                <div className="emi-table-head h2">
                    Emi Monthly Break-up Table
                </div>
                <table className="table">
                    <thead>
                        <tr className="tr">
                            <th className="th">Month</th>
                            <th className="th">Opening Balance</th>
                            <th className="th">EMI</th>
                            <th className="th">Interest paid monthly</th>
                            <th className="th">Principal paid monthly</th>
                            <th className="th">Closing Balance</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div></div>)
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
