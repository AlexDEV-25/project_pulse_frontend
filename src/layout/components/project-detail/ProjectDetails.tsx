import type { ProjectResponse } from '../../../dto/response';

const money = (value: number | null | undefined) =>
  `${(value ?? 0).toLocaleString('vi-VN')} Point`;
const date = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

export function ProjectDetails({
  project,
}: {
  project: ProjectResponse | null;
}) {
  return (
    <aside className="project-detail-card">
      <h2>Chi tiết Dự án</h2>
      <h3>Chi tiết Dự án</h3>
      <p>
        <b>Tên dự án:</b> {project?.projectName ?? 'Đang tải...'}
      </p>
      <p>
        <b>Người phụ trách:</b> {project?.pmName ?? '—'} (PM)
      </p>
      <p>
        <b>Trạng thái:</b>{' '}
        <span className="project-live-status">
          {project?.projectStatus === 'IN_PROGRESS'
            ? 'Đang thực hiện'
            : (project?.projectStatus ?? '—')}
        </span>
      </p>
      <hr />
      <p>
        <b>Ngày bắt đầu:</b> {date(project?.startAt)}
      </p>
      <p>
        <b>Ngày kết thúc:</b> {date(project?.endAt)}
      </p>
      <div className="project-timeline">
        <i />
        <i />
        <i />
        <i />
      </div>
      <hr />
      <p>
        <b>Ngân sách khách hàng:</b> {money(project?.clientBudget)}
      </p>
      <p>
        <b>Ngân sách dự án:</b> {money(project?.projectBudget)}
      </p>
      <div className="project-description">
        <b>Mô tả:</b> {project?.description || 'Chưa có mô tả.'}
      </div>
    </aside>
  );
}
