# db/seeds/makai_truth_ecosystem.rb

puts "--- 🏴‍☠️ Seeding MAKAI Truth Ecosystem ---"

# 1. Create Users & Accounts
def create_truth_user(username, display_name, role: 'Truth Pirate', berries: 100, is_guardian: false, is_verified: false)
  begin
    # Check if account already exists
    account = Account.find_local(username)
    if account
      puts "Account #{username} already exists."
      return account
    end

    puts "Creating account for #{username}..."
    account = Account.new(
      username: username,
      display_name: display_name,
      truth_berries: berries,
      is_guardian: is_guardian,
      is_seeking_verification: is_verified,
      pirate_role: role,
      trust_score: (is_guardian ? 90 : 50)
    )
    
    # User must be created and linked
    user = User.new(
      email: "#{username}@makai.p2p",
      password: 'password123',
      password_confirmation: 'password123',
      confirmed_at: Time.now,
      approved: true,
      agreement: true
    )
    user.account = account
    user.save!
    
    puts "Created user and account for: #{username}"
    account
  rescue => e
    puts "Error creating user #{username}: #{e.message}"
    puts e.backtrace.first(5).join("\n")
    # Return existing if possible
    Account.find_local(username)
  end
end

puts "Creating The Crew..."
luffy = create_truth_user('luffy', 'Monkey D. Luffy', role: 'Truth Pirate', berries: 500)
zoro = create_truth_user('zoro', 'Roronoa Zoro', role: 'Guardian', berries: 1000, is_guardian: true, is_verified: true)
nami = create_truth_user('nami', 'Nami Cat Burglar', role: 'Navigator', berries: 2000, is_verified: true)
robin = create_truth_user('robin', 'Nico Robin', role: 'Guardian', berries: 1500, is_guardian: true, is_verified: true)

# 2. Create Guilds
puts "Establishing Guilds..."
guilds_data = [
  { name: "Hiệp Sĩ Chống Lừa Đảo Crypto", focus: "Crypto", points: 8500, owner: zoro },
  { name: "Biệt Đội Săn Tin Giả Y Tế", focus: "Health", points: 4200, owner: robin },
  { name: "Hội Thẩm Định Bất Động Sản", focus: "Real Estate", points: 12000, owner: nami },
  { name: "Chiến Binh Sự Thật Chính Trị", focus: "Politics", points: 3000, owner: luffy }
]

guilds = guilds_data.map do |g|
  next if Guild.exists?(name: g[:name])
  guild = Guild.create!(
    name: g[:name],
    focus_area: g[:focus],
    reputation_points: g[:points],
    account: g[:owner]
  )
  # Add owner as leader
  GuildMembership.create!(guild: guild, account: g[:owner], role: :leader)
  guild
end.compact

# 3. Create Marketing Claims (Truth Ads)
puts "Launching Ad Campaigns..."
unless MarketingClaim.exists?(product_name: "Thần Dược Bách Bệnh")
  MarketingClaim.create!(
    account: nami,
    product_name: "Thần Dược Bách Bệnh",
    marketing_text: "Sản phẩm chiết xuất hoàn toàn từ thảo mộc, giúp chữa khỏi mọi bệnh chỉ sau 1 tuần sử dụng.",
    budget: 5000,
    status: "pending_review",
    target_url: "https://example.com/miracle-drug"
  )
end

unless MarketingClaim.exists?(product_name: "Khoá Học Đầu Tư Budai AI")
  mc_verified = MarketingClaim.create!(
    account: robin,
    product_name: "Khoá Học Đầu Tư Budai AI",
    marketing_text: "Học cách sử dụng Budai AI để tối ưu hoá danh mục đầu tư bất động sản an toàn.",
    budget: 10000,
    status: "broadcasted",
    crab_score: 94.5,
    is_crab_verified: true,
    target_url: "https://example.com/budai-course"
  )
end

# 4. Create Statuses (Truth Posts, Bounties, Real Estate)
puts "Broadcasting Truth Signals..."

unless Status.exists?(text: "🚨 Cảnh báo có dấu hiệu lừa đảo app đa cấp mới tại khu vực Quận 1. Ai có thêm bằng chứng không? Tôi treo thưởng 50 berries!")
  Status.create!(
    account: luffy,
    text: "🚨 Cảnh báo có dấu hiệu lừa đảo app đa cấp mới tại khu vực Quận 1. Ai có thêm bằng chứng không? Tôi treo thưởng 50 berries!",
    is_incident: true,
    incident_state: "reported",
    bounty_amount: 50,
    truth_score: 15.0,
    latitude: 10.7769,
    longitude: 106.7009
  )
end

unless Status.exists?(text: "Xác nhận: Thông tin về việc phong toả tài sản của dự án X là chính xác. Đã kiểm tra hồ sơ pháp lý tại toà án.")
  Status.create!(
    account: robin,
    text: "Xác nhận: Thông tin về việc phong toả tài sản của dự án X là chính xác. Đã kiểm tra hồ sơ pháp lý tại toà án.",
    claim_type: "FACT",
    truth_score: 98.2,
    safe_count: 45,
    fake_count: 1
  )
end

unless Status.exists?(text: "Bán lô đất chính chủ tại Basao Island. Vị trí cực đẹp, pháp lý sổ hồng riêng.")
  Status.create!(
    account: nami,
    text: "Bán lô đất chính chủ tại Basao Island. Vị trí cực đẹp, pháp lý sổ hồng riêng.",
    real_estate_price: 5500000000,
    real_estate_area: 120.5,
    real_estate_legal_status: "Sổ hồng riêng",
    real_estate_zoning: "Đất ở đô thị",
    latitude: 10.8231,
    longitude: 106.6297
  )
end

puts "--- ✅ Seeding Complete! Enjoy the Sea of Truth ---"
