extern crate emi_calc;
#[macro_use]
extern crate serde;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use emi_calc::emi;
use std::fs;
use std::io;
use std::io::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct CalculateEmi {
    amount: f64,
    rate: f64,
    tenure: i32,
}

fn index() -> impl Responder {
    HttpResponse::Ok().body(
        r#"
        <html>
            <head>
                <script src="/static/script.js" type="text/javascript"></script>
            </head>
            <body>
                <h1>Hellow</h1>
            </body>
        </html>
    "#,
    )
}

fn static_content(path: &str) -> Vec<u8> {
    let path = format!("static/{}", path);
    let source_path = std::path::Path::new(&path);
    let mut src = std::fs::File::open(&source_path).unwrap();
    let mut content = Vec::new();
    src.read_to_end(&mut content).unwrap();
    content
}

fn serve_static(path: web::Path<String>) -> impl Responder {
    HttpResponse::Ok().body(static_content(&path))
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
            .route("/static/{path}", web::get().to(serve_static))
    })
    .bind("127.0.0.1:8080")
    .unwrap()
    .run()
    .unwrap();
}
