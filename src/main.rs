extern crate emi_calc;
#[macro_use]
extern crate serde;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use emi_calc::emi;

#[derive(Serialize, Deserialize, Debug)]
pub struct CalculateEmi {
    amount: f64,
    rate: f64,
    tenure: i32,
}

fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello to Calculate EMI")
}

fn calculate_emi(data: web::Json<CalculateEmi>) -> impl Responder {
    let emi = emi::calculate_monthly(data.amount, data.rate, data.tenure);
    web::Json(serde_json::to_value(emi).unwrap())
}

fn main() {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
            .route("/calculate_emi", web::post().to(calculate_emi))
    })
    .bind("127.0.0.1:8080")
    .unwrap()
    .run()
    .unwrap();
}
