const fetch = require('node-fetch');

const RATE_LIMIT = 3; // максимум 3 карточки в секунду
let requestQueue = []; // очередь запросов

const apiUrl = 'https://kusnetsovra.amocrm.ru/api/v4/leads';
const access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdkMzBjOWZkMzIwYTYxY2YwMzRkZTg3MDc1ZjQzZWYzNDcxMmY2MjdiOTA4MWJhMTBlYmVlODRmM2JjZmNiNmU1ZTJmY2QyMjY1M2ExMGZiIn0.eyJhdWQiOiIxNjIzZTBjZS02NjY4LTQyYjAtYjhhZC01YmRkY2IzMGNiZDEiLCJqdGkiOiI3ZDMwYzlmZDMyMGE2MWNmMDM0ZGU4NzA3NWY0M2VmMzQ3MTJmNjI3YjkwODFiYTEwZWJlZTg0ZjNiY2ZjYjZlNWUyZmNkMjI2NTNhMTBmYiIsImlhdCI6MTcyNjU3MjM5NywibmJmIjoxNzI2NTcyMzk3LCJleHAiOjE3Mzk1Nzc2MDAsInN1YiI6IjExNTAzNzI2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTQ0MzIyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNDlmOWJhYzAtNDVkOC00MGRhLWEzMmEtNWQ1Mzc1ODc5MjY1IiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.nI3cxleK23ZAcSeJHuNdGTGa3aJW93KJ6QIxkeDz3NGKWqJcAs_axyPFRyz5IZTyKm_VCubYFAbTnn8BwRczLTn_lSrDI4br08mEd_uEvX683fnVznSEbTTADeWmB7ELj08JmET2_37YJwjF0LxyevdNCGHjFdP5tbQBwosxPkrctyJW3NdsyllQ9QKgy1ZelXIsF3BpYoKbLkq_6UVtggjGP2knapxRYS-Y7-_lndMacBPI9ernPUaH-Frin2zY9KoN81Ubs5AIc3YtsbzVzhVn9CcqKUQld2O1vJ2ds8TGH5T7w-mTjAnXAfA4yJzhSdnR882eDaWEF13Ogx7mWg"; // замените на свой токен


const processQueue = async () => {
  // Проверяем, пока есть запросы в очереди
  while (requestQueue.length > 0) {
    const res = requestQueue.shift(); // берем первый запрос из очереди

    try {
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        res.status(apiResponse.status).json({ error: 'Ошибка при получении данных' });
      } else {
        const data = await apiResponse.json();
        res.json(data); // Возвращаем данные на клиент
      }
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }

    // Ждем 1 секунду перед обработкой следующего запроса
    await new Promise((resolve) => setTimeout(resolve, 1000 / RATE_LIMIT));
  }
};

module.exports = async (req, res) => {
  // Добавляем запрос в очередь
  requestQueue.push(res);

  // Проверяем, есть ли уже запущенный таймер
  if (requestQueue.length === 1) {
    await processQueue();
  }
};
