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
                    let name = $('a.stylecolor span').text()
                    if(name.indexOf(user) >= 0)
                    {
                         console.log(name)
                         resolve([this.jar, name]);
                    }
                    reject('forgot user or pass')
               }
               catch(err){
                    reject(err);
               }
          })
     }
     getSchedules(semester){
          return new Promise(async (resolve, reject) =>{
               try {
                    var Schedules = [];
                    var $ = await this.requestServer({
                         URI: 'Home/DrawingSchedules?YearStudy=2020-2021&TermID=' + semester + '&Week=37&t=0.5507445018467367',
                    })
                    var ls = $('tr'), data = [];

                    ls.each(function(i, e){
                              // console.log($(this).text())
                              var lsChild = $(this).children('td');
                              var room = '';
                              lsChild.each(function(ix, el){
                                   room = ix == 0 ? $(el).text() : room;
                                   // console.log(room)
                                   if($(el).text() != '' && ix != 0)
                                        data.push(subjects($(el).text().split('-'), room, ix + 1))
                              })
                    })
                    resolve(data)
               } catch (error) {
                    reject(error);
               }
          })
          function subjects(data, room, day){
               return {
                    Thu: day == 8 ? 'CN' : day.toString(),
                    Phong: room,
                    MonHoc: data[1].split(':')[1].trim(),
                    MaLopHocPhan: data[2].split(':')[1],
                    LopHoc: data[3].split(':')[1].trim(),
                    TietHoc: data[4].split(':')[1] + ' - ' + data[5],
                    GiaoVien: data[6].split(':')[1].trim(),
               }
          }
     }
}

module.exports = APIHuflit;