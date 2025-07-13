
const Privacy = () => (
  <div style={{ width: '100vw', minHeight: '100vh', background: '#23242a', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ maxWidth: 700, margin: '80px auto', background: '#23242a', color: '#fff', borderRadius: 16, padding: 32, fontSize: 16 }}>
      <h2 style={{ fontWeight: 900, fontSize: 28, marginBottom: 24 }}>개인정보처리방침</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'none', color: '#fff' }}>
{`
1. 수집하는 개인정보 항목
- 이메일, 닉네임(이름), 비밀번호, 채팅 메시지

2. 개인정보의 수집 및 이용목적
- 회원 식별 및 서비스 제공
- 게임 기록, 랭킹, 채팅 등 서비스 운영

3. 개인정보의 보유 및 이용기간
- 회원 탈퇴 시 즉시 파기
- 관련 법령에 따라 일정 기간 보관할 수 있음

4. 개인정보의 제3자 제공
- 원칙적으로 외부에 제공하지 않음
- 법령에 따라 요구되는 경우에만 제공

5. 이용자의 권리
- 언제든지 개인정보 열람, 수정, 삭제, 처리정지 요청 가능

6. 문의처
- 이메일: me@daehyun.dev

7. 채팅 데이터 처리
- 서비스 내 채팅 기능을 통해 사용자가 입력한 메시지, 닉네임(또는 이메일) 등은 서비스 운영 및 커뮤니티 활성화 목적으로만 사용되며, 회원 탈퇴 시에도 채팅 데이터는 삭제 또는 익명화되지 않으며, 별도의 요청이 있어도 무시됩니다.

본 방침은 2025년 7월 13일부터 적용됩니다.
`}
      </pre>
    </div>
  </div>
);

export default Privacy; 