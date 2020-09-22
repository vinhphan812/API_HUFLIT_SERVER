var request = require('request-promise');
var cheerio = require('cheerio');

const API_SERVER = 'https://portal.huflit.edu.vn/';

class APIHuflit{
     constructor(){
          this.jar = request.jar();
          request = request.defaults({
               resolveWithFullResponse: true,
               simple: false,
               headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'vi,en-US;q=0.9,en;q=0.8',
               }
          });
     }
     requestServer(data = {URI, formData: ''}){
          let form = {
               uri: API_SERVER + data.URI,
               jar: this.jar,
               method: (typeof data.formData === 'object') ? 'post' : 'get',
               formData: data.formData,
               transform: (body) => cheerio.load(body)
          }
          return request(form);
     }
     login({user, pass}){
          return new Promise(async (resolve, reject) => {
               try{
                    const $ = await this.requestServer({
                         URI: '/Login',
                         formData: {
                              'txtTaiKhoan': user,
                              'txtMatKhau': pass
                         }
                    });
                    if($('a.stylecolor span').text().indexOf(user) >= 0)
                         resolve({isDone: true, cookie: this.jar._jar.store.idx['portal.huflit.edu.vn']['/']['ASP.NET_SessionId'].toString(), name: $('a.stylecolor span').text(), isTuition: await this.active()});
                    reject({isDone: false, msg:'forgot user or pass'});
               }
               catch(err){
                    console.log(err);
                    reject('server error');
               }
          })
     }
     getSchedules(semester){
          return new Promise(async (resolve, reject) =>{
               try {
                    var Schedules = [];
                    var $ = await this.requestServer({
                         URI: 'Home/DrawingSchedules?YearStudy=2020-2021&TermID=' + semester + '&Week=41&t=0.5507445018467367',
                         formData: '', 
                    });
                    $('.Content').each(function(i, e){
                         Schedules.push(subjects($(this), $(this)['0'].attribs.title));
                    });
                    resolve(Schedules);
               } catch (error) {
                    reject('server error');
               }
          })
          function subjects(data, day){
               return {
                    Thu: day,
                    Phong: data.children(':nth-child(1)').text(),
                    MonHoc: data.children(':nth-child(3)').text().split(' (')[0],
                    TietHoc: data.children(':nth-child(9)').text().split(': ')[1],
                    GiaoVien: data.children(':nth-child(11)').text().split(': ')[1],
               }
          }
     }
     ChangePass(oldPass, newPass) {
          return new Promise(async (resolve, reject) => {
               try {
                    var $ = await this.requestServer({
                         URI: '/API/Student/auther?t=0.6284478731933405&pw=' + oldPass + '&pw1=' + newPass + '&pw2=' + newPass,
                    });
                    if($.text() == 'Mật khẩu cũ không chính xác') reject($.text())
                    resolve($.text());
               } catch (error) {
                    reject('server error');
               } 
          })
     }
     CheckCookie(){
          return new Promise(async (resolve, reject) => {
               try {
                    var $ = await this.requestServer({
                         URI: '/Home',
                    });
                    return $('a.stylecolor span').text() ? resolve({isDone: true, name: $('a.stylecolor span').text(), isTuition: await this.active()}) : reject({isDone: false, msg: "GetCookie"});
                    
               } catch (error) {
                    reject('server error');
               }
          })
     }
     active(){
          return new Promise( async (resolve, reject) => {
               try {
                    var $ = await this.requestServer({
                         URI: 'Home/HienThiPhiHocPhan'
                    });   
                    console.log('success')
                    resolve(isTuition($('thead:nth-child(1) tr')));
               } catch (error) {
                    reject('server error');
               }
          })
          function isTuition(data){
               return data.children(':nth-child(6)').text() == 0 ? true : false;
          }
     }
     getTuition(){
          return new Promise( async (resolve, reject) => {
               try {
                    var Tuition = [];
                    var $ = await this.requestServer({
                         URI: 'Home/HienThiPhiHocPhan'
                    });                
                    Tuition.push(totalTuition($('thead:nth-child(1) tr')));
                    $('tbody tr').each(function(i, e){
                         if($(this).children().length == 10)
                              Tuition.push(toData($(this)));
                    })
                    resolve(Tuition);
               } catch (error) {
                    reject(error);
               }
          })
          function toData(data){
               return {
                    maMon: data.children(':nth-child(1)').text(),
                    tenMon: data.children(':nth-child(2)').text(),
                    soTien: data.children(':nth-child(3)').text(),
                    daDong: data.children(':nth-child(4)').text(),
                    canTru: data.children(':nth-child(5)').text(),
                    mienGiam: data.children(':nth-child(6)').text(),
                    conNo: data.children(':nth-child(7)').text(),
                    ngayDong: data.children(':nth-child(8)').text(),
                    soPhieuThu: data.children(':nth-child(9)').text()
               }
          }
          function totalTuition(data){
               return {
                    tongTien: data.children(':nth-child(2)').text(),
                    daDong: data.children(':nth-child(3)').text(),
                    canTru: data.children(':nth-child(4)').text(),
                    mienGiam: data.children(':nth-child(5)').text(),
                    conNo: data.children(':nth-child(6)').text()
               };
          }
     }
}

module.exports = APIHuflit;