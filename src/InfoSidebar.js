const { useState } = React;

function InfoSidebar() {
	const {
		SHARED_STYLES,
		TIER_DEFINITIONS,
		POINT_SYSTEM,
		DOCUMENTATION_LINKS,
		EVENTS_DATA,
		ANNOUNCEMENTS_DATA,
		CONTACT_INFO
	} = window;
	const SectionTitle = window.SectionTitle;
	const StyledSection = window.StyledSection;

	const [isOpen, setIsOpen] = useState(false);
	const [activeSection, setActiveSection] = useState('tiers');

	const menuItems = [
		{ id: 'tiers', label: 'Tiers', icon: '🏆' },
		{ id: 'points', label: 'Points', icon: '⚡' },
		{ id: 'docs', label: 'Docs', icon: '📄' },
		{ id: 'events', label: 'Events', icon: '📅' },
		{ id: 'announcements', label: 'News', icon: '📣' },
		{ id: 'contact', label: 'Contact', icon: '📞' }
	];

	const renderContent = () => {
		switch(activeSection) {
			case 'tiers':
				return (
					<div className="p-4 sm:p-6">
						<SectionTitle theme="gold">BATTLE PASS TIERS</SectionTitle>
						<div className="space-y-3 sm:space-y-4">
							{TIER_DEFINITIONS.map((tier, index) => (
								<div key={index} className="p-3 sm:p-4 text-xs sm:text-sm" style={{
									background: tier.bg,
									clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
									color: tier.color
								}}>
									<div className="font-bold text-sm sm:text-base mb-2">{tier.icon} {tier.tier} – {tier.range}</div>
									<div className="font-semibold leading-relaxed">{tier.desc}</div>
								</div>
							))}
						</div>
					</div>
				);
			case 'points':
				return (
					<div className="p-4 sm:p-6">
						<SectionTitle theme="blue">POINT SYSTEM</SectionTitle>
						<div className="space-y-2 sm:space-y-3">
							{POINT_SYSTEM.map((item, index) => (
								<div key={index} className="p-2 sm:p-3 bg-gray-800/50 border border-gray-600 text-xs sm:text-sm" style={{
									clipPath: SHARED_STYLES.clipPaths.button
								}}>
									<div className="flex justify-between items-center">
										<span className="text-white font-semibold">{item.activity}</span>
										<span className="text-yellow-400 font-bold text-sm sm:text-base">{item.points}</span>
									</div>
								</div>
							))}
							<div className="p-3 sm:p-4 mt-4 sm:mt-6 text-xs sm:text-sm text-center" style={{
								background: 'linear-gradient(135deg, #ffd700, #ffa500)',
								clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
								color: '#000'
							}}>
								<div className="font-bold text-sm sm:text-base mb-1">⚡ SPECIAL BONUSES</div>
								<div className="font-semibold text-xs sm:text-sm">1.5× Multiplier for Next 2 Events After Volunteering</div>
								<div className="font-semibold text-xs sm:text-sm mt-1">Paid Members Get Priority & Special Recognition</div>
							</div>
						</div>
					</div>
				);
			case 'docs':
				return (
					<div className="p-4 sm:p-6">
						<SectionTitle theme="blue">📄 DOCUMENTATION</SectionTitle>
						<div className="space-y-2 sm:space-y-3">
							{DOCUMENTATION_LINKS.map((doc, index) => (
								<a key={index} href={doc.url} target="_blank" rel="noopener noreferrer" 
									 className="block p-2 sm:p-3 text-xs sm:text-sm text-cyan-100 hover:text-cyan-200 transition-colors border border-gray-600 hover:bg-gray-800/30" 
									 style={{ clipPath: SHARED_STYLES.clipPaths.button }}>
									{doc.title}
								</a>
							))}
						</div>
					</div>
				);
			case 'events':
				return (
					<div className="p-4 sm:p-6">
						<SectionTitle theme="gold">📅 UPCOMING EVENTS</SectionTitle>
						<div className="space-y-3 sm:space-y-4">
							{EVENTS_DATA.map((event, index) => (
								<div key={index} className="p-3 sm:p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
									<div className="font-bold text-yellow-400 mb-2 text-sm sm:text-base">{event.date} – {event.title}</div>
									<div className="text-gray-300 text-xs sm:text-sm mb-1">{event.time}</div>
									<div className="text-gray-400 text-xs sm:text-sm">{event.location}</div>
								</div>
							))}
							<a href="https://tr.ee/kXIev9hrt3" target="_blank" rel="noopener noreferrer" 
								 className="block p-3 sm:p-4 text-sm sm:text-base text-center font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all" 
								 style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
								📅 Add the NSBEUM Calendar
							</a>
						</div>
					</div>
				);
			case 'announcements':
				return (
					<div className="p-4 sm:p-6">
						<SectionTitle theme="green">📣 ANNOUNCEMENTS</SectionTitle>
						<div className="space-y-2 sm:space-y-3">
							{ANNOUNCEMENTS_DATA.map((announcement, index) => (
								<a key={index} href={announcement.url} target="_blank" rel="noopener noreferrer" 
									 className="block p-2 sm:p-3 text-xs sm:text-sm text-emerald-100 hover:text-emerald-200 transition-colors border border-gray-600 hover:bg-gray-800/30" 
									 style={{ clipPath: SHARED_STYLES.clipPaths.button }}>
									{announcement.title}
								</a>
							))}
						</div>
					</div>
				);
			case 'contact':
				return (
					<div className="p-4 sm:p-6">
						<SectionTitle theme="purple">📞 CONTACT US</SectionTitle>
						<div className="space-y-3 sm:space-y-4">
							{CONTACT_INFO.map((contact, index) => (
								<div key={index} className="p-3 sm:p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
									<span className="text-gray-300 text-sm sm:text-base font-semibold">{contact.type}: </span>
									<div className="mt-1">
										<a href={contact.url} target="_blank" rel="noopener noreferrer" 
											 className="text-purple-300 hover:text-purple-200 transition-colors text-xs sm:text-sm">
											{contact.label}
										</a>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<>
			{/* Sidebar Toggle Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold transition-all duration-300 shadow-lg text-xs sm:text-sm"
				style={{
					clipPath: SHARED_STYLES.clipPaths.button
				}}
			>
				{isOpen ? '✕' : '📋'} <span className="hidden sm:inline">INFO</span>
			</button>
			{/* Sidebar Overlay */}
			{isOpen && (
				<div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
			)}
			{/* Sidebar */}
			<div className={`fixed top-0 right-0 h-full w-full sm:w-80 lg:w-96 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`} style={{
				background: SHARED_STYLES.sectionBg,
				clipPath: 'polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20px)',
				border: '2px solid #4a5568',
				boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
			}}>
				<div className="p-4 sm:p-6 pt-16 sm:pt-20">
					{/* Menu Buttons */}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-6">
						{menuItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveSection(item.id)}
								className={`p-2 text-xs font-semibold transition-all duration-300 ${
									activeSection === item.id 
										? 'bg-yellow-400/20 text-yellow-300 border-yellow-400' 
										: 'text-gray-300 hover:text-white hover:bg-gray-800/30 border-gray-600'
								} border`}
								style={{
									clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
								}}
							>
								<div className="text-sm sm:text-base mb-1">{item.icon}</div>
								<div className="text-xs">{item.label}</div>
							</button>
						))}
					</div>
					{/* Content */}
					<div className="pt-4 sm:pt-6">
						{renderContent()}
					</div>
				</div>
			</div>
		</>
	);
}

window.InfoSidebar = InfoSidebar;
