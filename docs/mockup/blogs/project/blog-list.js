/* Blog List — post data + render + filter + pagination */
(function () {
  const POSTS = [
    {
      id: 1,
      cat: "khuyen-mai",
      catLabel: { vi: "KHUYẾN MÃI", en: "PROMOTION" },
      badge: { vi: "ƯU ĐÃI HÈ", en: "SUMMER DEAL" },
      title: { vi: "Voucher mùa hè 2026 — giảm 25% nghỉ dưỡng tại SK Boutique", en: "Summer Voucher 2026 — 25% off stays at SK Boutique" },
      excerpt: { vi: "Áp dụng cho toàn bộ hạng phòng, kèm bữa sáng cao cấp và welcome drink. Số lượng có hạn — kết thúc lúc 23:59 ngày 30/06.", en: "Valid for all room types, includes premium breakfast and welcome drink. Limited inventory — ends 23:59, June 30." },
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "26 THG 5", en: "MAY 26" },
      read: { vi: "4 PHÚT", en: "4 MIN" },
      deadline: "2026-06-30T23:59:00",
      featured: true
    },
    {
      id: 2,
      cat: "cam-nang",
      catLabel: { vi: "CẨM NANG", en: "GUIDE" },
      title: { vi: "Bạn có biết? Phú Quốc 575km² và những điều thú vị ít ai kể", en: "Did you know? Phu Quoc's 575 km² and stories few people tell" },
      excerpt: { vi: "Hòn đảo lớn nhất Việt Nam có một lịch sử thú vị, một hệ sinh thái rất riêng và những góc nhỏ đáng yêu — chúng tôi đã tổng hợp lại.", en: "Vietnam's largest island has a curious history, a unique ecosystem and many small lovely corners — we put it all together." },
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "23 THG 5", en: "MAY 23" },
      read: { vi: "9 PHÚT", en: "9 MIN" }
    },
    {
      id: 3,
      cat: "trai-nghiem",
      catLabel: { vi: "TRẢI NGHIỆM", en: "EXPERIENCE" },
      title: { vi: "Family Room: không gian 60m² cho cả gia đình thư giãn", en: "Family Room: 60m² for the whole family to unwind" },
      excerpt: { vi: "Phòng VIP rộng rãi, ban công nhìn ra hồ bơi, và một góc đọc sách nhỏ cho trẻ. Đây là nơi gia đình bạn sẽ nhớ đến lâu.", en: "A spacious VIP room, balcony overlooking the pool, and a small reading nook for kids. This is where your family will linger." },
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "21 THG 5", en: "MAY 21" },
      read: { vi: "5 PHÚT", en: "5 MIN" }
    },
    {
      id: 4,
      cat: "am-thuc",
      catLabel: { vi: "ẨM THỰC", en: "CUISINE" },
      title: { vi: "Bữa sáng kiểu boutique: 5 món không thể bỏ qua", en: "Boutique-style breakfast: 5 dishes not to miss" },
      excerpt: { vi: "Phở Phú Quốc, bánh canh ghẹ, trứng la coque, croissant bơ Pháp và sinh tố nhiệt đới — đây là menu được khách quay lại nhiều nhất.", en: "Phu Quoc pho, crab noodle soup, soft-boiled eggs, French butter croissants and tropical smoothies — our most-revisited menu." },
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "19 THG 5", en: "MAY 19" },
      read: { vi: "6 PHÚT", en: "6 MIN" }
    },
    {
      id: 5,
      cat: "khuyen-mai",
      catLabel: { vi: "KHUYẾN MÃI", en: "PROMOTION" },
      badge: { vi: "COMBO HONEYMOON", en: "HONEYMOON" },
      title: { vi: "Combo Honeymoon — 3 ngày 2 đêm trọn gói lãng mạn", en: "Honeymoon Combo — 3 days 2 nights, fully romantic" },
      excerpt: { vi: "Phòng Quadruple cao cấp, bữa tối bên hồ bơi, trang trí cánh hoa, và dịch vụ check-out muộn — tất cả trong một mức giá ưu đãi.", en: "Premium Quadruple Room, poolside dinner, petal decor, and late check-out — all in one preferential rate." },
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "18 THG 5", en: "MAY 18" },
      read: { vi: "3 PHÚT", en: "3 MIN" },
      deadline: "2026-08-31T23:59:00"
    },
    {
      id: 6,
      cat: "cam-nang",
      catLabel: { vi: "CẨM NANG", en: "GUIDE" },
      title: { vi: "5 bãi biển đẹp nhất Phú Quốc 2026 — bản đồ trong tay", en: "5 best beaches of Phu Quoc 2026 — map in hand" },
      excerpt: { vi: "Từ bãi Sao nổi tiếng đến bãi Khem ít người biết, từ bãi Vũng Bầu hoang sơ đến bãi Trường — chúng tôi đã đi và viết lại.", en: "From famous Sao Beach to lesser-known Khem, from wild Vung Bau to long Truong — we walked them and wrote it down." },
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "16 THG 5", en: "MAY 16" },
      read: { vi: "11 PHÚT", en: "11 MIN" }
    },
    {
      id: 7,
      cat: "su-kien",
      catLabel: { vi: "SỰ KIỆN", en: "EVENT" },
      title: { vi: "Đêm gala mùa hè 2026 tại Marina Square", en: "Summer Gala Night 2026 at Marina Square" },
      excerpt: { vi: "Tối 15/06 — đêm nhạc acoustic, gian hàng ẩm thực địa phương và bắn pháo bông trên biển. Khách lưu trú nhận voucher tham dự miễn phí.", en: "June 15 — acoustic night, local food booths and fireworks over the sea. In-house guests get free admission vouchers." },
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "14 THG 5", en: "MAY 14" },
      read: { vi: "4 PHÚT", en: "4 MIN" }
    },
    {
      id: 8,
      cat: "meo-dat-phong",
      catLabel: { vi: "MẸO ĐẶT PHÒNG", en: "BOOKING TIP" },
      title: { vi: "Khi nào nên đặt phòng để có giá tốt nhất ở Phú Quốc?", en: "When to book to get the best rate in Phu Quoc?" },
      excerpt: { vi: "Phân tích dữ liệu 3 năm từ SK Boutique: tuần thứ mấy của tháng, tháng nào, và mẹo nhỏ cho cuối tuần dài.", en: "Three years of SK Boutique data: which week of the month, which month, and a small trick for long weekends." },
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "12 THG 5", en: "MAY 12" },
      read: { vi: "7 PHÚT", en: "7 MIN" }
    },
    {
      id: 9,
      cat: "tin-tuc",
      catLabel: { vi: "TIN TỨC", en: "NEWS" },
      title: { vi: "SK Boutique kỷ niệm 6 năm — cảm ơn 38.000 lượt khách", en: "SK Boutique turns 6 — thanks to our 38,000 guests" },
      excerpt: { vi: "Sáu năm — một con đường nhỏ trở thành nơi nghỉ chân quen thuộc của hàng nghìn gia đình. Lời cảm ơn từ đội ngũ.", en: "Six years — a small road has become a familiar resting place for thousands of families. Thank you from our team." },
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "10 THG 5", en: "MAY 10" },
      read: { vi: "3 PHÚT", en: "3 MIN" }
    },
    {
      id: 10,
      cat: "trai-nghiem",
      catLabel: { vi: "TRẢI NGHIỆM", en: "EXPERIENCE" },
      title: { vi: "Spa tại phòng: một buổi chiều chậm theo cách của bạn", en: "In-room spa: a slow afternoon, your way" },
      excerpt: { vi: "Dịch vụ massage Thái và liệu trình mặt nạ thiên nhiên — đặt trước 4 tiếng, đội ngũ sẽ chuẩn bị mọi thứ trong phòng của bạn.", en: "Thai massage and natural facial treatments — book 4 hours ahead and our team will prepare everything in your room." },
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "8 THG 5", en: "MAY 8" },
      read: { vi: "5 PHÚT", en: "5 MIN" }
    },
    {
      id: 11,
      cat: "am-thuc",
      catLabel: { vi: "ẨM THỰC", en: "CUISINE" },
      title: { vi: "Nước mắm Phú Quốc: hành trình của giọt vàng", en: "Phu Quoc fish sauce: the journey of the golden drop" },
      excerpt: { vi: "Một chuyến thăm cơ sở sản xuất truyền thống và câu chuyện về cá cơm than — di sản 200 năm của hòn đảo này.", en: "A visit to a traditional production house and the story of black anchovy — this island's 200-year heritage." },
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "6 THG 5", en: "MAY 6" },
      read: { vi: "8 PHÚT", en: "8 MIN" }
    },
    {
      id: 12,
      cat: "khuyen-mai",
      catLabel: { vi: "KHUYẾN MÃI", en: "PROMOTION" },
      badge: { vi: "MEMBER ONLY", en: "MEMBER ONLY" },
      title: { vi: "Thành viên SK: giảm thêm 10% và upgrade ngẫu nhiên", en: "SK Members: extra 10% off and random upgrades" },
      excerpt: { vi: "Đăng ký miễn phí, nhận ngay voucher 10% áp dụng cho lần đặt phòng đầu tiên — và cơ hội được nâng hạng phòng.", en: "Sign up free, get an instant 10% voucher for your first booking — and a chance to be upgraded." },
      image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "4 THG 5", en: "MAY 4" },
      read: { vi: "2 PHÚT", en: "2 MIN" },
      deadline: "2026-12-31T23:59:00"
    },
    // Page 2
    {
      id: 13, cat: "cam-nang", catLabel: { vi: "CẨM NANG", en: "GUIDE" },
      title: { vi: "Đi Phú Quốc mùa nào đẹp? Lịch thời tiết chi tiết", en: "Best time to visit Phu Quoc? Detailed weather calendar" },
      excerpt: { vi: "Tháng nào ít mưa, tháng nào lặng gió, tháng nào nên mang gì — kinh nghiệm đúc kết từ người làm dịch vụ tại đảo.", en: "Which months have less rain, which are calm, what to pack when — wisdom from those who serve on the island." },
      image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "2 THG 5", en: "MAY 2" }, read: { vi: "10 PHÚT", en: "10 MIN" }
    },
    {
      id: 14, cat: "su-kien", catLabel: { vi: "SỰ KIỆN", en: "EVENT" },
      title: { vi: "Workshop làm bánh trung thu boutique tháng 9", en: "Boutique mooncake workshop in September" },
      excerpt: { vi: "Một buổi chiều cuối tuần học cách làm bánh nướng nhân thập cẩm — dành cho khách lưu trú và gia đình.", en: "A weekend afternoon learning to make traditional mooncakes — for in-house guests and families." },
      image: "https://images.unsplash.com/photo-1464195244916-405fa0a82545?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "29 THG 4", en: "APR 29" }, read: { vi: "3 PHÚT", en: "3 MIN" }
    },
    {
      id: 15, cat: "trai-nghiem", catLabel: { vi: "TRẢI NGHIỆM", en: "EXPERIENCE" },
      title: { vi: "Thuê xe máy ở Phú Quốc: 7 lưu ý từ concierge", en: "Renting a scooter in Phu Quoc: 7 tips from our concierge" },
      excerpt: { vi: "Đi đâu, giá nào hợp lý, mũ bảo hiểm và những con đường đẹp nhất để khám phá — chúng tôi đã đúc kết tất cả.", en: "Where to rent, fair prices, helmets and the most beautiful roads to explore — we put it all in one place." },
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "26 THG 4", en: "APR 26" }, read: { vi: "6 PHÚT", en: "6 MIN" }
    },
    {
      id: 16, cat: "am-thuc", catLabel: { vi: "ẨM THỰC", en: "CUISINE" },
      title: { vi: "Cà phê đảo: 4 quán có view khiến bạn ngồi cả buổi", en: "Island coffee: 4 cafes with views worth lingering" },
      excerpt: { vi: "Từ quán nhỏ trong rừng đến rooftop nhìn ra biển — và một quán có view hoàng hôn đẹp nhất bạn từng thấy.", en: "From a small forest cafe to a rooftop overlooking the sea — and one with the most beautiful sunset view." },
      image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "24 THG 4", en: "APR 24" }, read: { vi: "5 PHÚT", en: "5 MIN" }
    },
    {
      id: 17, cat: "cam-nang", catLabel: { vi: "CẨM NANG", en: "GUIDE" },
      title: { vi: "Một ngày ở phía Bắc đảo: lộ trình đi và về", en: "A day in the north of the island: round-trip itinerary" },
      excerpt: { vi: "Vinpearl Safari, Bãi Dài, mũi Gành Dầu, làng chài Rạch Vẹm — gói gọn trong một ngày mà vẫn nhẩn nha.", en: "Vinpearl Safari, Long Beach, Ganh Dau Cape, Rach Vem fishing village — packed in a day yet leisurely." },
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "22 THG 4", en: "APR 22" }, read: { vi: "12 PHÚT", en: "12 MIN" }
    },
    {
      id: 18, cat: "khuyen-mai", catLabel: { vi: "KHUYẾN MÃI", en: "PROMOTION" },
      badge: { vi: "EARLY BIRD", en: "EARLY BIRD" },
      title: { vi: "Đặt trước 60 ngày — giảm 15% và miễn phí đưa đón sân bay", en: "Book 60 days ahead — 15% off and free airport transfer" },
      excerpt: { vi: "Lập kế hoạch sớm để hè đi không lo. Áp dụng cho phòng Family và Quadruple, đi cùng bữa sáng cho 2 người lớn.", en: "Plan ahead for a worry-free summer. Valid for Family and Quadruple rooms, with breakfast for 2 adults." },
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "20 THG 4", en: "APR 20" }, read: { vi: "3 PHÚT", en: "3 MIN" },
      deadline: "2026-07-15T23:59:00"
    },
    {
      id: 19, cat: "trai-nghiem", catLabel: { vi: "TRẢI NGHIỆM", en: "EXPERIENCE" },
      title: { vi: "Một buổi sáng ở chợ cá Hàm Ninh", en: "A morning at Ham Ninh fish market" },
      excerpt: { vi: "Đi cùng đầu bếp của khách sạn từ 5 giờ sáng — học cách chọn tôm, mực và cá tươi nhất trong ngày.", en: "Tag along with our chef from 5am — learn how to pick the freshest shrimp, squid and fish of the day." },
      image: "https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "18 THG 4", en: "APR 18" }, read: { vi: "7 PHÚT", en: "7 MIN" }
    },
    {
      id: 20, cat: "tin-tuc", catLabel: { vi: "TIN TỨC", en: "NEWS" },
      title: { vi: "SK Boutique được vinh danh trong top boutique 2026 của TripAdvisor", en: "SK Boutique honored in TripAdvisor's 2026 top boutique list" },
      excerpt: { vi: "Một cột mốc ý nghĩa cho đội ngũ — kết quả của những điều rất nhỏ, được làm rất kỹ trong suốt 6 năm qua.", en: "A meaningful milestone for our team — the result of small things done well over the past 6 years." },
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "16 THG 4", en: "APR 16" }, read: { vi: "2 PHÚT", en: "2 MIN" }
    },
    {
      id: 21, cat: "am-thuc", catLabel: { vi: "ẨM THỰC", en: "CUISINE" },
      title: { vi: "Bún quậy Phú Quốc: món ăn 'cãi vã' của đảo", en: "Bun Quay: Phu Quoc's most 'argued-over' noodle" },
      excerpt: { vi: "Bạn tự pha nước chấm. Bạn quậy bún trong tô. Bạn ăn. Đơn giản — nhưng đậm vị và lạ.", en: "You mix your own sauce. You stir the noodles. You eat. Simple — but bold and unusual." },
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "14 THG 4", en: "APR 14" }, read: { vi: "4 PHÚT", en: "4 MIN" }
    },
    // Page 3
    {
      id: 22, cat: "cam-nang", catLabel: { vi: "CẨM NANG", en: "GUIDE" },
      title: { vi: "Mang gì khi đi Phú Quốc? Checklist 8 món thiết yếu", en: "What to pack for Phu Quoc? 8-item essentials checklist" },
      excerpt: { vi: "Kem chống nắng SPF 50, dép lê, áo dài tay nhẹ, kính bơi… và một thứ mà ai đi rồi cũng tiếc vì không mang theo.", en: "SPF 50, slippers, light long sleeves, swim goggles… and one thing everyone who's been wishes they had." },
      image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "12 THG 4", en: "APR 12" }, read: { vi: "5 PHÚT", en: "5 MIN" }
    },
    {
      id: 23, cat: "meo-dat-phong", catLabel: { vi: "MẸO ĐẶT PHÒNG", en: "BOOKING TIP" },
      title: { vi: "Đặt qua website chính thức: 5 lợi ích bạn không biết", en: "Booking via the official website: 5 benefits you may not know" },
      excerpt: { vi: "Giá tốt nhất, hoàn hủy linh hoạt, voucher tích lũy, ưu tiên upgrade — và một bonus dành cho thành viên thân thiết.", en: "Best rate, flexible cancellation, accumulating vouchers, upgrade priority — plus a bonus for loyal members." },
      image: "https://images.unsplash.com/photo-1601247309108-2103c7e95527?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "10 THG 4", en: "APR 10" }, read: { vi: "4 PHÚT", en: "4 MIN" }
    },
    {
      id: 24, cat: "trai-nghiem", catLabel: { vi: "TRẢI NGHIỆM", en: "EXPERIENCE" },
      title: { vi: "Một đêm ở Superior: tinh gọn, ấm cúng, đủ đầy", en: "A night in Superior: trim, cozy, complete" },
      excerpt: { vi: "Phòng 25m² với mọi thứ bạn cần. Lựa chọn tuyệt vời cho cặp đôi hoặc khách công tác — đẹp, gọn, và kín đáo.", en: "A 25m² room with everything you need. Perfect for couples or business travelers — clean, compact, discreet." },
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80",
      date: { vi: "8 THG 4", en: "APR 8" }, read: { vi: "4 PHÚT", en: "4 MIN" }
    }
  ];

  const PAGE_SIZE = 9;
  let activeFilter = "all";
  let currentPage = 1;

  const grid = document.getElementById("postGrid");
  const pagination = document.getElementById("pagination");
  const pageInfo = document.getElementById("pageInfo");
  const chipRow = document.getElementById("chipRow");

  function getLang() {
    return document.documentElement.getAttribute("data-lang") || "vi";
  }

  function filteredPosts() {
    if (activeFilter === "all") return POSTS;
    return POSTS.filter((p) => p.cat === activeFilter);
  }

  function cardHTML(post) {
    const lang = getLang();
    const hasDeadline = !!post.deadline;
    const isPromo = post.cat === "khuyen-mai";
    return `
      <article class="post-card reveal${isPromo ? " post-card--promo" : ""}" data-cat="${post.cat}" ${hasDeadline ? `data-deadline="${post.deadline}"` : ""}>
        <a href="Blog Detail.html" class="post-card__media-link" aria-label="${post.title[lang]}">
          <div class="post-card__media">
            ${post.badge ? `<span class="badge badge--gold post-card__badge" data-vi="${post.badge.vi}" data-en="${post.badge.en}">${post.badge[lang]}</span>` : ""}
            <img src="${post.image}" alt="${post.title[lang]}" loading="lazy" />
          </div>
        </a>
        <p class="post-card__cat" data-vi="${post.catLabel.vi}" data-en="${post.catLabel.en}">${post.catLabel[lang]}</p>
        <h3 class="post-card__title">
          <a href="Blog Detail.html" data-vi="${escapeAttr(post.title.vi)}" data-en="${escapeAttr(post.title.en)}">${post.title[lang]}</a>
        </h3>
        <p class="post-card__excerpt" data-vi="${escapeAttr(post.excerpt.vi)}" data-en="${escapeAttr(post.excerpt.en)}">${post.excerpt[lang]}</p>
        ${hasDeadline ? countdownHTML(post.deadline) : ""}
        <div class="post-card__meta">
          <span data-vi="${post.date.vi}" data-en="${post.date.en}">${post.date[lang]}</span>
          <span class="post-card__meta-dot"></span>
          <span data-vi="${post.read.vi} ĐỌC" data-en="${post.read.en} READ">${post.read[lang]} ĐỌC</span>
        </div>
      </article>
    `;
  }

  function countdownHTML(deadline) {
    return `
      <div class="countdown" data-deadline="${deadline}">
        <span class="countdown__label" data-vi="CÒN" data-en="ENDS IN">CÒN</span>
        <span class="countdown__cell"><span data-cd="d">--</span><sub data-vi="ngày" data-en="days">ngày</sub></span>
        <span class="countdown__sep">:</span>
        <span class="countdown__cell"><span data-cd="h">--</span><sub data-vi="giờ" data-en="hrs">giờ</sub></span>
        <span class="countdown__sep">:</span>
        <span class="countdown__cell"><span data-cd="m">--</span><sub data-vi="phút" data-en="min">phút</sub></span>
        <span class="countdown__sep">:</span>
        <span class="countdown__cell"><span data-cd="s">--</span><sub data-vi="giây" data-en="sec">giây</sub></span>
      </div>
    `;
  }

  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  function render() {
    const list = filteredPosts();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    if (slice.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h4 data-vi="Chưa có bài viết trong chuyên mục này" data-en="No articles in this category yet">Chưa có bài viết trong chuyên mục này</h4>
          <p data-vi="Hãy quay lại trong vài ngày tới — chúng tôi đang viết." data-en="Check back in a few days — we are writing.">Hãy quay lại trong vài ngày tới — chúng tôi đang viết.</p>
        </div>
      `;
    } else {
      grid.innerHTML = slice.map(cardHTML).join("");
    }

    renderPagination(totalPages);
    renderPageInfo(list.length, slice.length);

    // Re-apply current language to newly inserted nodes
    const lang = getLang();
    grid.querySelectorAll("[data-vi]").forEach((el) => {
      const next = el.getAttribute(lang === "vi" ? "data-vi" : "data-en");
      if (next != null) el.textContent = next;
    });

    // Trigger reveal observer for newly added cards
    initRevealForNewNodes(grid);

    startCountdowns();
  }

  function renderPagination(totalPages) {
    const lang = getLang();
    const prevLabel = lang === "vi" ? "‹ Trước" : "‹ Prev";
    const nextLabel = lang === "vi" ? "Sau ›" : "Next ›";
    let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} data-page="prev">${prevLabel}</button>`;
    const range = pageRange(currentPage, totalPages);
    range.forEach((p) => {
      if (p === "…") {
        html += `<span class="page-ellipsis">…</span>`;
      } else {
        html += `<button class="page-btn ${p === currentPage ? "is-active" : ""}" data-page="${p}">${p}</button>`;
      }
    });
    html += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="next">${nextLabel}</button>`;
    pagination.innerHTML = html;
  }

  function pageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  }

  function renderPageInfo(total, showing) {
    const lang = getLang();
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = (currentPage - 1) * PAGE_SIZE + showing;
    if (showing === 0) { pageInfo.textContent = ""; return; }
    pageInfo.textContent = lang === "vi"
      ? `Hiển thị ${start}–${end} của ${total} bài viết`
      : `Showing ${start}–${end} of ${total} articles`;
  }

  function startCountdowns() {
    document.querySelectorAll(".countdown[data-deadline]").forEach((el) => {
      const target = new Date(el.getAttribute("data-deadline")).getTime();
      const tick = () => {
        const now = Date.now();
        const diff = Math.max(0, target - now);
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const setCell = (key, v) => {
          const node = el.querySelector(`[data-cd="${key}"]`);
          if (node) node.textContent = String(v).padStart(2, "0");
        };
        setCell("d", d);
        setCell("h", h);
        setCell("m", m);
        setCell("s", s);
      };
      tick();
      if (el._tick) clearInterval(el._tick);
      el._tick = setInterval(tick, 1000);
    });
  }

  // Re-create observer scoped to a container for newly added .reveal
  function initRevealForNewNodes(container) {
    const els = container.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ----- Events ----- */
  chipRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chipRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeFilter = chip.dataset.filter;
    currentPage = 1;
    render();
    // Smooth scroll to top of grid
    const target = document.querySelector(".filter-section__head");
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });

  pagination.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.disabled) return;
    const totalPages = Math.max(1, Math.ceil(filteredPosts().length / PAGE_SIZE));
    const p = btn.dataset.page;
    if (p === "prev") currentPage = Math.max(1, currentPage - 1);
    else if (p === "next") currentPage = Math.min(totalPages, currentPage + 1);
    else currentPage = Number(p);
    render();
    const target = document.querySelector(".filter-section__head");
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });

  document.addEventListener("langchange", () => render());

  document.addEventListener("DOMContentLoaded", render);
})();
