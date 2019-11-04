extern crate emi_calc;
#[macro_use]
extern crate serde;

use actix_web::http::header::ContentType;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use emi_calc::emi;
use std::io::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct CalculateEmi {
    amount: f64,
    rate: f64,
    tenure: i32,
}
// <script src="/static/script.js" type="text/javascript"></script>
fn index() -> impl Responder {
    let index_page = static_content("emi/build/index.html");
    HttpResponse::Ok().set(ContentType::html()).body(index_page)
}

fn static_content(path: &str) -> Vec<u8> {
    let source_path = std::path::Path::new(&path);
    let mut src = std::fs::File::open(&source_path).unwrap();
    let mut content = Vec::new();
    src.read_to_end(&mut content).unwrap();
    content
}

fn serve_js_static(path: web::Path<String>) -> impl Responder {
    let path = format!("emi/build/static/js/{}", path);
    println!("{}", path);
    HttpResponse::Ok().body(static_content(&path))
}

fn serve_css_static(path: web::Path<String>) -> impl Responder {
    let path = format!("emi/build/static/css/{}", path);
    println!("{}", path);
    HttpResponse::Ok()
        .set_header("Accept", "text/css,*/*;q=0.")
        .set_header("Accept-Language", "en-GB,en-US;q=0.9,en;q=0.8")
        .set_header("Accept-Encoding", "gzip")
        .body(static_content(&path))
}

fn serve_media_static(path: web::Path<String>) -> impl Responder {
    let path = format!("emi/build/static/media/{}", path);
    println!("{}", path);
    HttpResponse::Ok()
        .set_header("Content-Type", "image/svg+xml; charset=UTF-8")
        .set_header("Accept-Ranges", "bytes")
        .set_header("Accept-Encoding", "gzip")
        .body(static_content(&path))
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
            .route("/static/css/{path}", web::get().to(serve_css_static))
            .route("/static/js/{path}", web::get().to(serve_js_static))
            .route("/static/media/{path}", web::get().to(serve_media_static))
    })
    .bind("127.0.0.1:8080")
    .unwrap()
    .run()
    .unwrap();
}
