import { db } from "./index";
import { templates, templateVariants, sections, users } from "./schema";
import bcrypt from "bcryptjs";

const DEMO_EMAIL = "demo@wedding.local";
const DEMO_PASSWORD = "Aa@123456#";

const seedTemplates = [
  {
    name: "Song Long Đỏ - Truyền Thống Sang Trọng",
    slug: "song-long-do",
    category: "truyen_thong" as const,
    description: "Song Long Đỏ - Truyền Thống Sang Trọng",
    tags: ["song", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/song-long-do.svg",
    metadata: {"description": "Song Long Đỏ - Truyền Thống Sang Trọng", "source": "chungdoi.com", "highlights": ["Rồng đôi (song long) tượng trưng cho sự thịnh vượng, quyền lực và hạnh phúc viên mãn trong văn hóa Á Đông. Đây là motif truyền thống phổ biến trong đám cưới Việt Nam, mang ý nghĩa chúc phúc cho đôi uyên ương.", "Song Long Đỏ phù hợp nhất cho đám cưới truyền thống, lễ vu quy, và tiệc cưới trang trọng. Tông đỏ là màu may mắn trong văn hóa Việt Nam, tạo không khí ấm áp và sang trọng.", "Không. Tông đỏ trên Song Long Đỏ được chọn lọc kỹ — đỏ đậm sang trọng, không chói mắt. Kết hợp với họa tiết rồng vàng gold tạo sự cân bằng hài hòa, trang trọng mà vẫn dễ chịu khi xem."]},
  },
  {
    name: "Hoa Mộc Xanh - Boho Thanh Nhã Tông Xanh",
    slug: "hoa-moc-xanh",
    category: "lang_man" as const,
    description: "Hoa Mộc Xanh - Boho Thanh Nhã Tông Xanh",
    tags: ["hoa", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/boho_floral_green.svg",
    metadata: {"description": "Hoa Mộc Xanh - Boho Thanh Nhã Tông Xanh", "source": "chungdoi.com", "highlights": ["Hoa Mộc Xanh dùng tông xanh lá thanh nhã, tạo cảm giác tươi mát gần gũi thiên nhiên. Hoa Mộc Hồng dùng tông hồng ấm lãng mạn với bố cục ảnh nghiêng đan xen đặc biệt. Cả hai đều có họa tiết hoa watercolor boho nhưng màu sắc và cảm xúc khác nhau.", "Thiệp phù hợp nhất với đám cưới boho rustic, tiệc cưới vườn ngoài trời, hoặc đám cưới eco với chủ đề xanh tự nhiên. Tông xanh lá và hoa watercolor tạo bầu không khí thanh mát, gần gũi.", "Khi cuộn trang, họa tiết hoa xanh di chuyển với tốc độ khác nhau so với nội dung chính, tạo chiều sâu và cảm giác sống động. Hiệu ứng này làm cho thiệp trông sinh động hơn nhiều so với thiệp tĩnh thông thường."]},
  },
  {
    name: "Long Phụng Đỏ - Cổ Điển Rồng Phượng",
    slug: "long-phung-do",
    category: "co_phuc" as const,
    description: "Long Phụng Đỏ - Cổ Điển Rồng Phượng",
    tags: ["long", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/dragon_phoenix_red.svg",
    metadata: {"description": "Long Phụng Đỏ - Cổ Điển Rồng Phượng", "source": "chungdoi.com", "highlights": ["Rồng đại diện cho chú rể (dương), phượng đại diện cho cô dâu (âm). Cặp rồng phượng trên Long Phụng Đỏ tượng trưng cho sự hài hòa âm dương, hôn nhân viên mãn — biểu tượng tối thượng trong đám cưới Việt Nam.", "Có. Long Phụng Đỏ có phần lễ vu quy và tiệc cưới riêng biệt, thứ bậc gia đình đầy đủ — phù hợp với phong tục đám cưới truyền thống có cả nhà trai và nhà gái.", "Long Phụng Đỏ phù hợp nhất cho đám cưới truyền thống Việt Nam với đầy đủ nghi thức vu quy và tiệc cưới. Tông đỏ trang trọng, họa tiết rồng phượng cổ điển tạo không khí thiêng liêng."]},
  },
  {
    name: "Song Phụng Đỏ - Đôi Phụng Hoàng Thanh Lịch",
    slug: "song-phung-do",
    category: "co_phuc" as const,
    description: "Song Phụng Đỏ - Đôi Phụng Hoàng Thanh Lịch",
    tags: ["song", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/double_phoenix_red.svg",
    metadata: {"description": "Song Phụng Đỏ - Đôi Phụng Hoàng Thanh Lịch", "source": "chungdoi.com", "highlights": ["Phụng hoàng tượng trưng cho phẩm hạnh, vẻ đẹp cao quý và sự hòa hợp. Đôi phụng trên thiệp Song Phụng Đỏ mang ý nghĩa chúc phúc cho cô dâu — khác với rồng đôi (song long) tượng trưng cho sức mạnh.", "Song Phụng Đỏ dùng họa tiết đôi phụng hoàng thanh lịch, mang vẻ đẹp mềm mại và nữ tính hơn. Song Long Đỏ dùng họa tiết rồng đôi mạnh mẽ, trang trọng hơn. Cả hai đều mang phong cách truyền thống Việt Nam.", "Song Phụng Đỏ phù hợp cho đám cưới mọi miền. Họa tiết phụng hoàng là biểu tượng phổ biến trong văn hóa Việt Nam, đặc biệt được yêu thích ở đám cưới miền Nam với phong cách thanh lịch, trang nhã."]},
  },
  {
    name: "Mẫu Thiệp Mai Lan Trắng - Thiệp Cưới Tối Giản Thanh Lịch",
    slug: "mai-lan-trang",
    category: "toi_gian" as const,
    description: "Mẫu Thiệp Mai Lan Trắng - Thiệp Cưới Tối Giản Thanh Lịch",
    tags: ["mai", "trắng"],
    thumbnailUrl: "/images/template-previews/listing/jasmine_white.svg",
    metadata: {"description": "Mẫu Thiệp Mai Lan Trắng - Thiệp Cưới Tối Giản Thanh Lịch", "source": "chungdoi.com", "highlights": ["Mẫu này phù hợp nhất với đám cưới phong cách tối giản, garden wedding, hoặc tiệc cưới ngoài trời. Màu nền kem trắng và xanh olive tạo cảm giác tự nhiên, thanh lịch — không quá rực rỡ nhưng vẫn có điểm nhấn riêng.", "Khung hoa mai lan (jasmine) — loài hoa tượng trưng cho vẻ đẹp thuần khiết, sự thanh cao và tình yêu chân thành. Khung hoa được đặt ở phần đầu thiệp, bao quanh tên dâu rể.", "Thiệp dùng hai màu chính: nền kem trắng ấm (#FFFAF7) và xanh olive đậm (#404A1D). Kết hợp này tạo vẻ thanh lịch, tự nhiên — khác với các mẫu đỏ hoặc hồng thông thường."]},
  },
  {
    name: "Nhật Bình Đỏ - Retro Cổ Điển, Giấy Kem Ấm",
    slug: "nhat-binh-do",
    category: "de_thuong" as const,
    description: "Nhật Bình Đỏ - Retro Cổ Điển, Giấy Kem Ấm",
    tags: ["nhat", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/nhat_binh_red.svg",
    metadata: {"description": "Nhật Bình Đỏ - Retro Cổ Điển, Giấy Kem Ấm", "source": "chungdoi.com", "highlights": ["Không. Hoàng Kim Đỏ là nền đỏ thẫm với khung hoa vàng kim và phong cách hoàng gia sang trọng. Nhật Bình Đỏ là nền giấy kem, chữ nâu và đỏ son, họa tiết mây–hoa–đèn và phong bì nâu riêng — nhìn và cảm giác khác hẳn, không dùng chung giao diện với Hoàng Kim.", "Phù hợp đám cưới truyền thống, lễ gia tiên, tiệc có chủ đề di sản hoặc cặp đôi muốn thiệp ấm, thanh lịch mà vẫn rõ nét Việt — không cần nền đỏ rực toàn trang.", "Có. Chữ nâu và đỏ son trên nền giấy kem được phối để tương phản rõ, đọc tốt trên điện thoại và máy tính."]},
  },
  {
    name: "Thanh Diệp Xanh - Thanh Lịch Hiện Đại",
    slug: "thanh-diep-xanh",
    category: "hien_dai" as const,
    description: "Thanh Diệp Xanh - Thanh Lịch Hiện Đại",
    tags: ["thanh", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/elegant_leaf_green.svg",
    metadata: {"description": "Thanh Diệp Xanh - Thanh Lịch Hiện Đại", "source": "chungdoi.com", "highlights": ["Thanh Diệp Xanh sử dụng bố cục thoáng đãng, typography rõ ràng, họa tiết lá xanh nhẹ nhàng và nhiều khoảng trắng. Phong cách tối giản giúp thiệp trông thanh lịch, dễ đọc — đúng xu hướng cưới đương đại.", "Thanh Diệp Xanh phù hợp cho đám cưới hiện đại, tiệc cưới minimalist, hoặc bất kỳ ai yêu thích sự thanh lịch, giản dị. Tên cặp đôi và thông tin lễ cưới được hiển thị rõ ràng, nổi bật.", "Không. Phong cách minimalist của Thanh Diệp Xanh là sự tinh tế có chủ đích — ít chi tiết nhưng mỗi yếu tố đều được cân nhắc. Nhiều đám cưới hiện đại ưa chuộng sự thanh lịch này hơn hoa văn phức tạp."]},
  },
  {
    name: "Minimalism Đỏ - Phong Cách Tối Giản Thanh Lịch",
    slug: "minimalism-do",
    category: "toi_gian" as const,
    description: "Minimalism Đỏ - Phong Cách Tối Giản Thanh Lịch",
    tags: ["minimalism", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/minimalism_red.svg",
    metadata: {"description": "Minimalism Đỏ - Phong Cách Tối Giản Thanh Lịch", "source": "chungdoi.com", "highlights": ["Phong cách minimalism được thể hiện qua nền trắng tinh tế, typography rõ ràng, khoảng trắng rộng và chỉ một màu nhấn duy nhất là đỏ. Không có hoa văn dày đặc hay viền trang trí. Mọi yếu tố trên thiệp đều có chủ đích, hướng sự chú ý vào tên cô dâu chú rể và thông tin lễ cưới.", "Minimalism Đỏ dùng nền trắng tối giản với đỏ làm điểm nhấn, ít họa tiết, nhiều khoảng trắng. Song Long Đỏ có họa tiết rồng đôi truyền thống, đậm chất cổ điển. Chọn Minimalism nếu thích phong cách hiện đại, chọn Song Long nếu thích truyền thống.", "Khác nhau. Minimalism Đỏ dùng đỏ như một điểm nhấn tinh tế trên nền trắng, không phải đỏ đậm toàn diện. Tạo cảm giác hiện đại, thanh lịch hơn là truyền thống."]},
  },
  {
    name: "Long Phụng V2 Đỏ - Cổ Điển Hiện Đại",
    slug: "long-phung-v2-do",
    category: "co_phuc" as const,
    description: "Long Phụng V2 Đỏ - Cổ Điển Hiện Đại",
    tags: ["long", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/dragon_phoenix_v2_red.svg",
    metadata: {"description": "Long Phụng V2 Đỏ - Cổ Điển Hiện Đại", "source": "chungdoi.com", "highlights": ["Long Phụng V2 là phiên bản cải tiến với họa tiết rồng phượng tinh tế hơn, đường nét mảnh mai, typography rõ ràng và bố cục thoáng hơn. Giữ nguyên tinh thần truyền thống nhưng trải nghiệm xem mượt mà hơn.", "Nếu bạn thích phong cách hiện đại hơn với bố cục thoáng, chọn V2. Nếu thích họa tiết rồng phượng đậm nét, chi tiết hơn, chọn Long Phụng gốc. Cả hai đều có đầy đủ tính năng giống nhau.", "Long Phụng V2 giữ motif rồng phượng nhưng với đường nét mảnh mai, tinh tế hơn. Hoa văn bớt dày đặc, tạo sự thoáng đãng. Tổng thể cảm giác hiện đại hơn phiên bản gốc mà vẫn giữ tinh thần truyền thống."]},
  },
  {
    name: "Song Long Xanh - Thanh Lịch Tự Nhiên",
    slug: "song-long-xanh",
    category: "truyen_thong" as const,
    description: "Song Long Xanh - Thanh Lịch Tự Nhiên",
    tags: ["song", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/double_dragon_green.svg",
    metadata: {"description": "Song Long Xanh - Thanh Lịch Tự Nhiên", "source": "chungdoi.com", "highlights": ["Xanh lá tượng trưng cho sự sinh sôi, phát triển và hy vọng — ý nghĩa rất đẹp cho khởi đầu cuộc sống mới. Song Long Xanh kết hợp nét truyền thống của rồng đôi với gam màu xanh mát dịu.", "Rất phù hợp! Tông xanh lá tự nhiên của Song Long Xanh hòa quyện tuyệt vời với không gian ngoài trời, sân vườn. Đây là lựa chọn lý tưởng khi bạn muốn nét truyền thống mà vẫn tươi mới.", "Họa tiết rồng đôi giống nhau về đường nét, nhưng phối màu khác. Song Long Xanh dùng tông xanh lá mát dịu, rồng được thể hiện với sắc xanh ngọc — tạo cảm giác thanh thoát hơn so với tông đỏ mạnh mẽ."]},
  },
  {
    name: "Vườn Xuân Xanh - Thiên Nhiên Tươi Mát",
    slug: "vuon-xuan-xanh",
    category: "thien_nhien" as const,
    description: "Vườn Xuân Xanh - Thiên Nhiên Tươi Mát",
    tags: ["vuon", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/spring_garden_green.svg",
    metadata: {"description": "Vườn Xuân Xanh - Thiên Nhiên Tươi Mát", "source": "chungdoi.com", "highlights": ["Rất phù hợp! Tông xanh lá tươi mát và họa tiết lá cây vẽ tay trên Vườn Xuân Xanh hòa quyện tuyệt vời với không gian ngoài trời, sân vườn. Lựa chọn lý tưởng cho đám cưới phong cách eco.", "Cả hai đều dùng tông xanh lá nhưng Vườn Xuân Xanh có họa tiết hoa lá phong phú, phong cách thiên nhiên ấm áp. Thanh Diệp Xanh thiên về minimalist, tối giản với bố cục thoáng đãng hơn.", "Có. Họa tiết lá cây trên Vườn Xuân Xanh được minh họa vẽ tay tỉ mỉ, tạo nét nghệ thuật và sự ấm áp mà thiết kế digital thông thường khó đạt được."]},
  },
  {
    name: "Hoàng Kim Đỏ - Sang Trọng Hoàng Gia",
    slug: "hoang-kim-do",
    category: "sang_trong" as const,
    description: "Hoàng Kim Đỏ - Sang Trọng Hoàng Gia",
    tags: ["hoang", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/royal_red.svg",
    metadata: {"description": "Hoàng Kim Đỏ - Sang Trọng Hoàng Gia", "source": "chungdoi.com", "highlights": ["Hoàng Kim Đỏ phù hợp nhất cho đám cưới sang trọng, tiệc cưới hoàng gia, hoặc cặp đôi muốn thiệp cưới đẳng cấp và ấn tượng. Sự kết hợp đỏ thẫm và vàng kim tạo không gian trang trọng, quyền uy.", "Thiệp dùng nền đỏ thẫm (#3E0001) kết hợp với điểm nhấn vàng kim (#E1BC7C). Đây là bảng màu cổ điển của phong cách hoàng gia — đỏ tượng trưng cho may mắn và hạnh phúc, vàng kim tượng trưng cho sự thịnh vượng.", "Hoàng Kim Đỏ dùng nền đỏ thẫm với điểm nhấn vàng kim, phong cách hiện đại sang trọng. Song Long Đỏ có họa tiết rồng đôi truyền thống trên nền đỏ tươi hơn. Hoàng Kim hướng đến vẻ đẹp hoàng gia đương đại, Song Long hướng đến nét cổ điển truyền thống."]},
  },
  {
    name: "Hoa Mộc Hồng - Boho Lãng Mạn Tông Hồng",
    slug: "hoa-moc-hong",
    category: "lang_man" as const,
    description: "Hoa Mộc Hồng - Boho Lãng Mạn Tông Hồng",
    tags: ["hoa", "hồng"],
    thumbnailUrl: "/images/template-previews/listing/boho_floral_pink.svg",
    metadata: {"description": "Hoa Mộc Hồng - Boho Lãng Mạn Tông Hồng", "source": "chungdoi.com", "highlights": ["Hoa Mộc Hồng dùng tông hồng ấm (#9D6D63) với hai màu viền ảnh khác nhau cho dâu (hồng pastel) và rể (tím xám), tạo cảm giác lãng mạn. Bố cục tên ngắn đặt góc trên phải, ảnh nghiêng đan xen bên dưới. Hoa Mộc Xanh dùng tông xanh lá thanh nhã với thanh trang trí ngang.", "Thiệp phù hợp nhất với đám cưới boho rustic, tiệc cưới vườn ngoài trời, hoặc đám cưới với chủ đề tự nhiên lãng mạn. Tông hồng ấm và hoa watercolor tinh tế tạo bầu không khí dịu dàng, tình tứ.", "Có! Thiệp có 2 khung ảnh được thiết kế đặc biệt — một nghiêng phải cho ảnh người thứ nhất, một nghiêng trái cho người thứ hai — tạo bố cục đan xen đẹp mắt. Bạn có thể upload ảnh dọc tỷ lệ 2:3."]},
  },
  {
    name: "Chibi Đỏ - Dễ Thương Minh Họa",
    slug: "chibi-red",
    category: "de_thuong" as const,
    description: "Chibi Đỏ - Dễ Thương Minh Họa",
    tags: ["chibi"],
    thumbnailUrl: "/images/template-previews/listing/chibi_red.svg",
    metadata: {"description": "Chibi Đỏ - Dễ Thương Minh Họa", "source": "chungdoi.com", "highlights": ["Chibi Đỏ kết hợp phong cách minh họa dễ thương với tông đỏ truyền thống, tạo sự cân bằng giữa vui nhộn và trang trọng. Phù hợp cho cặp đôi trẻ trung muốn thiệp cưới mang dấu ấn cá nhân.", "Không. Hình chibi là minh họa được thiết kế sẵn, không phải ảnh cá nhân. Bạn vẫn có thể tải ảnh cưới thật vào album ảnh trên thiệp Chibi Đỏ.", "Chibi Đỏ vui nhộn nhưng vẫn giữ tông đỏ truyền thống. Người lớn tuổi thường thấy dễ thương và gần gũi. Nếu muốn trang trọng hơn, có thể chọn Song Long Đỏ hoặc Long Phụng Đỏ."]},
  },
  {
    name: "Song Phụng Xanh - Đôi Phụng Hoàng Thanh Nhã",
    slug: "song-phung-xanh",
    category: "co_phuc" as const,
    description: "Song Phụng Xanh - Đôi Phụng Hoàng Thanh Nhã",
    tags: ["song", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/double_phoenix_green.svg",
    metadata: {"description": "Song Phụng Xanh - Đôi Phụng Hoàng Thanh Nhã", "source": "chungdoi.com", "highlights": ["Song Phụng Xanh giữ nguyên họa tiết đôi phụng hoàng đặc trưng nhưng dùng tông xanh lá thanh nhã thay vì đỏ truyền thống. Phù hợp cho cặp đôi muốn nét phụng hoàng truyền thống mà vẫn tươi mới, gần gũi thiên nhiên hơn.", "Song Phụng Xanh dùng tông xanh lá thanh nhã, mát dịu — không phải xanh dương. Nếu bạn thích tông xanh dương (lam), có thể xem Song Long Lam hoặc Long Phụng Lam.", "Phong bì Song Phụng Xanh dùng tông xanh lá đồng bộ với thiệp, tạo trải nghiệm liền mạch từ lúc mở phong bì đến khi xem nội dung thiệp bên trong."]},
  },
  {
    name: "Anh Đào Hồng - Lãng Mạn Hoa Anh Đào",
    slug: "anh-dao-hong",
    category: "lang_man" as const,
    description: "Anh Đào Hồng - Lãng Mạn Hoa Anh Đào",
    tags: ["anh", "hồng"],
    thumbnailUrl: "/images/template-previews/listing/cherry_blossom_pink.svg",
    metadata: {"description": "Anh Đào Hồng - Lãng Mạn Hoa Anh Đào", "source": "chungdoi.com", "highlights": ["Hoa anh đào (sakura) tượng trưng cho vẻ đẹp thanh khiết và tình yêu nồng nàn. Cánh hoa bay rơi trên thiệp Anh Đào Hồng tạo không gian thơ mộng, phù hợp cho đám cưới lãng mạn.", "Anh Đào Hồng đẹp cho mọi mùa, đặc biệt phù hợp với đám cưới mùa xuân. Bảng màu hồng pastel dịu dàng tạo cảm giác lãng mạn, nữ tính — phù hợp cả tiệc trong nhà và ngoài trời.", "Có. Anh Đào Hồng có hiệu ứng cánh hoa anh đào bay rơi nhẹ nhàng, tạo không gian thơ mộng và sống động khi khách mời xem thiệp. Hiệu ứng này là điểm nhấn độc đáo của mẫu."]},
  },
  {
    name: "Long Phụng Xanh - Cổ Điển Thanh Lịch",
    slug: "long-phung-xanh",
    category: "co_phuc" as const,
    description: "Long Phụng Xanh - Cổ Điển Thanh Lịch",
    tags: ["long", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/dragon_phoenix_green.svg",
    metadata: {"description": "Long Phụng Xanh - Cổ Điển Thanh Lịch", "source": "chungdoi.com", "highlights": ["Long Phụng Xanh giữ nguyên họa tiết rồng phượng và bố cục đặc trưng nhưng dùng tông xanh thanh lịch thay vì đỏ truyền thống. Phù hợp cho cặp đôi muốn nét truyền thống nhưng không quá đỏ rực.", "Có. Long Phụng Xanh hỗ trợ đầy đủ thông tin thứ bậc gia đình hai bên, lễ vu quy và tiệc cưới riêng biệt — giống như tất cả mẫu trong dòng Long Phụng.", "Long Phụng Xanh dùng tông xanh lá thanh lịch (không phải xanh dương). Nếu bạn thích tông xanh dương (lam), chọn Long Phụng Lam. Cả hai đều có họa tiết rồng phượng giống nhau."]},
  },
  {
    name: "Vườn Xuân Đỏ - Thiên Nhiên Ấm Áp",
    slug: "vuon-xuan-do",
    category: "thien_nhien" as const,
    description: "Vườn Xuân Đỏ - Thiên Nhiên Ấm Áp",
    tags: ["vuon", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/spring_garden_red.svg",
    metadata: {"description": "Vườn Xuân Đỏ - Thiên Nhiên Ấm Áp", "source": "chungdoi.com", "highlights": ["Vườn Xuân Đỏ mang phong cách thiên nhiên với họa tiết hoa lá, mềm mại và gần gũi hơn. Song Long thiên về truyền thống với họa tiết rồng đôi trang trọng. Cả hai đều có tông đỏ nhưng cảm giác rất khác.", "Vườn Xuân Đỏ phù hợp cho mọi mùa, đặc biệt đám cưới mùa xuân. Họa tiết hoa lá tươi tắn kết hợp tông đỏ ấm áp tạo không khí vui vẻ, lãng mạn.", "Vườn Xuân Đỏ sử dụng họa tiết hoa xuân tổng hợp — hoa đào, hoa mai và lá cây mùa xuân. Phối cùng tông đỏ ấm, tạo cảm giác khu vườn rực rỡ đón xuân."]},
  },
  {
    name: "Hoa Mộc Nâu - Boho Rustic Tông Nâu Ấm",
    slug: "hoa-moc-nau",
    category: "lang_man" as const,
    description: "Hoa Mộc Nâu - Boho Rustic Tông Nâu Ấm",
    tags: ["hoa", "nâu"],
    thumbnailUrl: "/images/template-previews/listing/boho_floral_brown.svg",
    metadata: {"description": "Hoa Mộc Nâu - Boho Rustic Tông Nâu Ấm", "source": "chungdoi.com", "highlights": ["Ba mẫu Hoa Mộc cùng phong cách hoa watercolor boho nhưng khác bảng màu: Nâu ấm áp vintage rustic, Hồng lãng mạn nữ tính, Xanh tươi mát thiên nhiên. Chọn theo cảm xúc và phong cách đám cưới bạn muốn.", "Tông nâu earthy trên Hoa Mộc Nâu gợi phong cách boho rustic vintage — ấm áp, mộc mạc và có chiều sâu. Kết hợp hoa watercolor, thiệp mang vẻ đẹp như tranh vẽ tay trong không gian mộc mạc.", "Hoa Mộc Nâu đẹp nhất cho đám cưới mùa thu với tông earthy ấm áp. Tuy nhiên phong cách rustic vintage phù hợp quanh năm — đặc biệt đẹp cho tiệc cưới ngoài trời, sân vườn, hoặc không gian vintage."]},
  },
  {
    name: "Mẫu Thiệp Hoa Lụa Nâu - Tối Giản Ấm Áp, Thanh Lịch Và Hiện Đại",
    slug: "hoa-lua-nau",
    category: "de_thuong" as const,
    description: "Mẫu Thiệp Hoa Lụa Nâu - Tối Giản Ấm Áp, Thanh Lịch Và Hiện Đại",
    tags: ["hoa", "nâu"],
    thumbnailUrl: "/images/template-previews/listing/silk_flora_brown.svg",
    metadata: {"description": "Mẫu Thiệp Hoa Lụa Nâu - Tối Giản Ấm Áp, Thanh Lịch Và Hiện Đại", "source": "chungdoi.com", "highlights": ["Cả hai đều tối giản, nhưng Hoa Lụa Nâu tập trung vào cảm giác ấm áp và chiều sâu chữ nghĩa, trong khi Mai Lan Trắng thiên về vẻ sáng, nhẹ và có khung hoa nổi bật ở phần đầu thiệp.", "Mẫu sử dụng bảng màu ấm, dịu mắt để giữ cảm giác tinh tế và gần gũi. Bạn có thể tùy chỉnh toàn bộ nội dung như tên, địa điểm, ảnh và lời mời trong bố cục có sẵn.", "Phù hợp tiệc tông ấm, rustic nhẹ, outdoor hoặc đám cưới tối giản hiện đại — vừa thanh lịch vừa gần gũi."]},
  },
  {
    name: "Vườn Xuân Lam - Thanh Lịch Dịu Mát",
    slug: "vuon-xuan-lam",
    category: "thien_nhien" as const,
    description: "Vườn Xuân Lam - Thanh Lịch Dịu Mát",
    tags: ["vuon", "lam"],
    thumbnailUrl: "/images/template-previews/listing/spring_garden_blue.svg",
    metadata: {"description": "Vườn Xuân Lam - Thanh Lịch Dịu Mát", "source": "chungdoi.com", "highlights": ["Vườn Xuân Lam phù hợp cho cặp đôi yêu thích sự nhẹ nhàng, tinh tế. Tông xanh lam dịu mát kết hợp họa tiết thiên nhiên tạo cảm giác thanh lịch, yên bình — phù hợp cho đám cưới phong cách thanh lịch.", "Phong bì Vườn Xuân Lam dùng tông lam dịu mát với họa tiết hoa lá nhẹ nhàng. Khi khách mời mở link, hiệu ứng phong bì tạo trải nghiệm giống nhận thiệp cưới thật.", "Cả hai dùng tông lam nhưng phong cách khác nhau. Vườn Xuân Lam có họa tiết hoa lá thiên nhiên mềm mại, còn Song Long Lam dùng họa tiết rồng đôi truyền thống trên nền lam. Chọn theo sở thích phong cách."]},
  },
  {
    name: "Long Phụng Lam - Cổ Điển Sang Trọng",
    slug: "long-phung-lam",
    category: "co_phuc" as const,
    description: "Long Phụng Lam - Cổ Điển Sang Trọng",
    tags: ["long", "lam"],
    thumbnailUrl: "/images/template-previews/listing/dragon_phoenix_blue.svg",
    metadata: {"description": "Long Phụng Lam - Cổ Điển Sang Trọng", "source": "chungdoi.com", "highlights": ["Long Phụng Lam kết hợp tông xanh lam quý phái với họa tiết rồng phượng vàng gold, tạo vẻ đẹp sang trọng và thanh lịch. Phù hợp cho đám cưới mong muốn sự trang trọng mà vẫn hiện đại.", "Rồng phượng vàng gold nổi bật trên nền lam tạo vẻ đẹp quý phái, sang trọng. Phối màu này gợi cảm giác hoàng gia — khác biệt rõ rệt so với tông đỏ truyền thống.", "Long Phụng Lam phù hợp cho đám cưới sang trọng, quý phái. Cặp đôi yêu thích phong cách cổ điển nhưng muốn điểm nhấn hiện đại qua tông lam sẽ thích mẫu này."]},
  },
  {
    name: "Song Long Lam - Lãng Mạn Dịu Dàng",
    slug: "song-long-lam",
    category: "truyen_thong" as const,
    description: "Song Long Lam - Lãng Mạn Dịu Dàng",
    tags: ["song", "lam"],
    thumbnailUrl: "/images/template-previews/listing/double_dragon_blue.svg",
    metadata: {"description": "Song Long Lam - Lãng Mạn Dịu Dàng", "source": "chungdoi.com", "highlights": ["Rất phù hợp! Sắc lam gợi liên tưởng đến biển cả và bầu trời, tạo cảm giác lãng mạn và dịu dàng. Song Long Lam là lựa chọn tuyệt vời cho tiệc cưới chủ đề biển hoặc ngoài trời.", "Sắc lam (xanh dương nhẹ) gợi liên tưởng đến bầu trời trong xanh và biển cả bao la — tượng trưng cho tình yêu sâu rộng và bền vững. Kết hợp rồng đôi truyền thống, Song Long Lam mang vẻ đẹp dịu dàng lãng mạn.", "Phong bì Song Long Lam dùng tông lam nhẹ nhàng, đồng bộ với thiệp bên trong. Khi khách mời mở phong bì, hiệu ứng chuyển tiếp mượt mà từ phong bì sang nội dung thiệp."]},
  },
  {
    name: "Cô Ba Đỏ - Cổ Điển Việt, Giấy Kem Ấm",
    slug: "co-ba-do",
    category: "co_phuc" as const,
    description: "Cô Ba Đỏ - Cổ Điển Việt, Giấy Kem Ấm",
    tags: ["co", "đỏ"],
    thumbnailUrl: "/images/template-previews/listing/co_ba_red.svg",
    metadata: {"description": "Cô Ba Đỏ - Cổ Điển Việt, Giấy Kem Ấm", "source": "chungdoi.com", "highlights": ["Không. Hoàng Kim Đỏ là nền đỏ thẫm với khung hoa vàng kim và phong cách hoàng gia sang trọng. Cô Ba Đỏ là nền giấy cũ, chữ nâu và đỏ son, hình ảnh Chợ Bến Thành và phong bì nâu riêng — nhìn và cảm giác khác hẳn, không dùng chung giao diện với Hoàng Kim.", "Phù hợp đám cưới truyền thống, lễ gia tiên, tiệc có chủ đề di sản hoặc cặp đôi muốn thiệp ấm, thanh lịch mà vẫn rõ nét Việt — không cần nền đỏ rực toàn trang.", "Có. Chữ nâu và đỏ son trên nền giấy cũ được phối để tương phản rõ, đọc tốt trên điện thoại và máy tính."]},
  },
  {
    name: "Long Phụng Huyền - Sang Trọng Huyền Bí",
    slug: "long-phung-huyen",
    category: "co_phuc" as const,
    description: "Long Phụng Huyền - Sang Trọng Huyền Bí",
    tags: ["long", "huyền"],
    thumbnailUrl: "/images/template-previews/listing/dragon_phoenix_black.svg",
    metadata: {"description": "Long Phụng Huyền - Sang Trọng Huyền Bí", "source": "chungdoi.com", "highlights": ["Long Phụng Huyền là lựa chọn táo bạo và cá tính. Tông đen kết hợp họa tiết rồng phượng vàng gold tạo vẻ đẹp hoàng gia, rất ấn tượng. Phù hợp cho cặp đôi muốn thiệp cưới độc đáo, khác biệt.", "Không hề. Họa tiết vàng gold nổi bật trên nền đen tạo sự sang trọng và quý phái. Nhiều cặp đôi chọn Long Phụng Huyền vì vẻ đẹp ấn tượng, khiến khách mời nhớ mãi.", "Long Phụng Huyền dùng nền đen huyền bí, táo bạo và ấn tượng mạnh. Long Phụng Lam dùng nền xanh lam thanh lịch, nhã nhặn hơn. Cả hai đều sang trọng nhưng Huyền cá tính hơn, Lam dễ phối hơn."]},
  },
  {
    name: "Hoàng Kim Lam - Sang Trọng Hoàng Gia",
    slug: "hoang-kim-lam",
    category: "sang_trong" as const,
    description: "Hoàng Kim Lam - Sang Trọng Hoàng Gia",
    tags: ["hoang", "lam"],
    thumbnailUrl: "/images/template-previews/listing/royal_blue.svg",
    metadata: {"description": "Hoàng Kim Lam - Sang Trọng Hoàng Gia", "source": "chungdoi.com", "highlights": ["Hoàng Kim Lam phù hợp nhất cho đám cưới sang trọng, tiệc cưới hoàng gia, hoặc cặp đôi muốn thiệp cưới đẳng cấp và ấn tượng. Sự kết hợp xanh lam thẫm và vàng kim tạo không gian trang trọng, huyền bí.", "Thiệp dùng nền xanh lam thẫm (#00112E) kết hợp với điểm nhấn vàng kim (#E1BC7C). Đây là bảng màu cổ điển của hoàng gia phương Tây — xanh lam tượng trưng cho sự trung thành và bí ẩn, vàng kim tượng trưng cho sự thịnh vượng.", "Hoàng Kim Lam dùng nền xanh lam thẫm tạo cảm giác huyền bí, lịch lãm. Hoàng Kim Đỏ dùng nền đỏ thẫm mang phong cách may mắn, quyền uy. Cả hai đều có điểm nhấn vàng kim và phong cách hoàng gia nhưng sắc thái cảm xúc khác nhau."]},
  },
  {
    name: "Hoàng Kim Xanh - Sang Trọng Hoàng Gia",
    slug: "hoang-kim-xanh",
    category: "sang_trong" as const,
    description: "Hoàng Kim Xanh - Sang Trọng Hoàng Gia",
    tags: ["hoang", "xanh"],
    thumbnailUrl: "/images/template-previews/listing/royal_green.svg",
    metadata: {"description": "Hoàng Kim Xanh - Sang Trọng Hoàng Gia", "source": "chungdoi.com", "highlights": ["Hoàng Kim Xanh phù hợp nhất cho đám cưới sang trọng tại vườn, tiệc cưới hoàng gia với chủ đề thiên nhiên, hoặc cặp đôi muốn thiệp cưới đẳng cấp nhưng gần gũi. Sự kết hợp xanh lục thẫm và vàng kim tạo không gian trang trọng, tươi mát.", "Thiệp dùng nền xanh lục thẫm (#001A08) kết hợp với điểm nhấn vàng kim (#E1BC7C). Xanh lục tượng trưng cho sự sống, phát triển và thiên nhiên, vàng kim tượng trưng cho sự thịnh vượng và đẳng cấp.", "Ba phiên bản Hoàng Kim dùng cùng khung hoa vàng kim và font chữ, chỉ khác màu nền: Đỏ (#3E0001) mang phong cách may mắn quyền uy, Lam (#00112E) mang vẻ huyền bí lịch lãm, Xanh (#001A08) mang vẻ tự nhiên tươi mát. Chọn theo cảm xúc và chủ đề đám cưới."]},
  },
];

export async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [demoUser] = await db
    .insert(users)
    .values({
      email: DEMO_EMAIL,
      passwordHash,
      name: "Demo User",
      role: "user",
    })
    .onConflictDoNothing()
    .returning();

  if (demoUser) {
    console.log(`Seeded demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
  }

  console.log("Seeding templates...");

  await db.delete(sections);
  await db.delete(templateVariants);
  await db.delete(templates);

  for (const tmpl of seedTemplates) {
    const [inserted] = await db.insert(templates).values(tmpl).returning();

    await db.insert(templateVariants).values({
      templateId: inserted.id,
      variantName: "Classic",
      colorTokens: {
        primary: "#C41E3A",
        secondary: "#FFD700",
        accent: "#8B0000",
        background: "#FFF8F0",
        text: "#1A1A1A",
      },
      isDefault: true,
    });

    const defaultSections = [
      { sectionType: "hero", order: 0, isRequired: true },
      { sectionType: "couple-names", order: 1, isRequired: true },
      { sectionType: "event-info", order: 2, isRequired: true },
      { sectionType: "venue", order: 3, isRequired: true },
      { sectionType: "timeline", order: 4, isRequired: false },
      { sectionType: "gallery", order: 5, isRequired: false },
      { sectionType: "rsvp", order: 6, isRequired: true },
    ] as const;

    for (const sec of defaultSections) {
      await db.insert(sections).values({
        templateId: inserted.id,
        sectionType: sec.sectionType,
        order: sec.order,
        isRequired: sec.isRequired,
        isEditable: true,
        contentSchema: {
          type: "object",
          properties: {},
        },
        defaultContent: {},
        animations: { entrance: "fade", duration: 600 },
      });
    }

    console.log(`Seeded: ${tmpl.name}`);
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
