extern crate emi_calc;
use emi_calc::emi;

fn main() {
    let emi = emi::calculate_monthly(1000000.0, 8.5, 12);
    println!("Hello, world!:: {:#?}", emi);
}
