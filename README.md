Adresinden projeye erişebilirsiniz. https://pf-todo-api.vercel.app

Mevcut ReactJS projesini çalıştırmak için sırasıyla aşağıdaki komutları konsolunuza yazınız.

Projeyi klonluyoruz.

git clone https://github.com/MelihErpek/pf-todo-api.git 
cd pf-todo-api

Projedeki kütüphaneleri yüklüyoruz ve projeyi başlatıyoruz.

npm install && yarn install 

Sonrasında app.js dosyasında .env'den aldığı değerler olan KEY(OpenAI API Key) ve DB(MongoDB Bağlantı URL'i) değerlerini kendi bilgilerinizle değiştiriniz.

Bu işlemlerden sonra aşağıdaki komut ile projeyi çalıştırabilirsiniz. 

node app.js

Bu işlemler tamamlandığında proje aşağıdaki adreste çalışacaktır.

http://localhost:5000
