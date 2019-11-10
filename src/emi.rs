pub trait Round {
    fn round_off(self, digit: u32) -> Self;
}

impl Round for f64 {
    fn round_off(self, digit: u32) -> Self {
        let p = 10u32.pow(digit) as f64;
        ((self * p).round() / p)
    }
}

#[derive(Debug, Serialize)]
pub struct MonthEmi {
    pub sno: i32,
    pub amount: f64,
    pub interest: f64,
    pub principal: f64,
    pub remaining_principal: f64,
}

#[derive(Debug, Serialize)]
pub struct FinalCalculation {
    pub monthly_data: Vec<MonthEmi>,
    pub total_interest: f64,
    pub total_emi_amount: f64,
    pub principal: f64,
    pub rate: f64,
    pub tenure: i32,
    pub emi: f64,
}

pub fn calculate_monthly(amount: f64, rate: f64, tenure: i32) -> FinalCalculation {
    let emi_amount = calculate_emi(amount, rate, tenure);
    let mut total_interest = 0.0;
    let total_emi_amount = emi_amount * tenure as f64;
    let mut total_principal = 0.0;
    let interest_per_month = rate / (12 * 100) as f64;
    let mut monthly_data = vec![];
    let mut loan_amount = amount;
    for x in 1..(tenure + 1) {
        let interest = loan_amount * interest_per_month;
        total_interest += interest;
        let principal = (emi_amount - interest).round_off(2);
        total_principal += principal;
        monthly_data.push(MonthEmi {
            sno: x,
            amount: loan_amount.round_off(2),
            interest: interest.round_off(2),
            principal: principal.round_off(2),
            remaining_principal: (loan_amount - (emi_amount - interest)).round_off(2),
        });
        loan_amount -= emi_amount - interest;
    }

    FinalCalculation {
        monthly_data,
        total_interest: total_interest.round_off(2),
        total_emi_amount: total_emi_amount.round_off(2),
        principal: total_principal.round_off(2),
        tenure,
        rate,
        emi: emi_amount.round_off(2),
    }
}

pub fn calculate_emi(amount: f64, rate: f64, tenure: i32) -> f64 {
    let interest_per_month = rate / (12 * 100) as f64;
    let simplified_power = (interest_per_month + 1.0).powi(tenure);
    let emi_per_month = amount * interest_per_month * (simplified_power / (simplified_power - 1.0));
    emi_per_month
}
