(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')
  
  //切換模式
  const switchIcon = document.querySelector('.switchIcon')
  let currentData = []

  axios.get(INDEX_URL).then((response) => {
    dataPanel.className = 'row card-mode'
    data.push(...response.data.results)
    displayDataList (data)
    getTotalPages (data)
    getPageData(1, data)
    currentData = data
  }).catch((err) => console.log(err))

  //listen to data panel 
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      console.log(event.target)
      console.log(event.target.dataset.id)
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    } 
  })
  
  //電影清單
  function displayDataList (data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      if (dataPanel.matches('.card-mode')) {//切換模式}
        htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6>${item.title}</h6>
            </div>
            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!--add botton-->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
      } else if (dataPanel.matches('.list-mode')) {//切換模式
        htmlContent += `
        <div class="list w-100">
          <hr>
          <div class="single-movie d-flex justify-content-between">
            <div class="info">
              <p class="text-capitalize">${item.title}</p>
            </div>
          <div class="buttion">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
       `
      }
      
    })
    dataPanel.innerHTML = htmlContent
  }

  
  //詳細資料
  function showMovie(id) {
    //get elements 
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')
    //set request to url 
    const url = INDEX_URL + id
    //sent request to show API
    axios.get(url)
    .then((response) => {
      const data = response.data.results
      console.log(data)
    //insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = data.description
    })
    .catch((err) => console.log(err))
  }

  //搜尋
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
  event.preventDefault()
  console.log('click!')
  let input = searchInput.value
  let results = data.filter(movie => movie.title.toLowerCase().includes(input))
  console.log(results)
  diplayDataList(data)
  })


  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)
    currentData = results
  })



  //存取收藏清單
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))
    if (list.some( item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }


  //製作分頁
  let currentPage = 1
  const pagination = document.querySelector('#pagination')
  const ITEM_PER_PAGE = 12

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    // displayDataList(data)
    getPageData(1, data)       // add this
  }).catch((err) => console.log(err))

  //分頁按鈕執行
  pagination.addEventListener('click', function (event) {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
      currentPage = event.target.dataset.page
    }
  })

  function getTotalPages (data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }
  
  let paginationData = []

  function getPageData (pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  function getPageData_bar (pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList_bar(pageData)
  }

  //切換模式
  switchIcon.addEventListener('click', (event) => {
    if(event.target.matches('.fa-bars')) {
      dataPanel.className = 'row list-mode'    
    }
    if(event.target.matches('.fa-th')) {     
      dataPanel.className = 'row card-mode'    
    }
    getPageData(currentPage, currentData)   
  })
  
})()

