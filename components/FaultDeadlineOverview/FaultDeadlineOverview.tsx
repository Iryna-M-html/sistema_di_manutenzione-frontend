'use client';

import React from 'react';
import css from './FaultDeadlineOverview.module.css';
import { FaultCard } from '@/types/faultType';
import { format, isPast } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface FaultDeadlineOverviewProps {
  faults: FaultCard[];
  selectedDate: string;
}

const FaultDeadlineOverview = ({
  faults,
  selectedDate,
}: FaultDeadlineOverviewProps) => {
  const router = useRouter();

  const displayDate = selectedDate
    ? format(new Date(selectedDate), 'MMMM yyyy', { locale: it })
    : format(new Date(), 'MMMM yyyy', { locale: it });

  const handleDetailClick = (id: string) => {
    router.push(`/maintenance-worker/${id}`);
  };

  return (
    <div className={css.overviewContainer}>
      <h3 className={css.monthTitle}>
        {displayDate.charAt(0).toUpperCase() + displayDate.slice(1)}
      </h3>

      <ul className={css.cardList}>
        {faults.map(fault => {
          // Проверка: просрочен ли дедлайн (если статус не Completed)
          const isOverdue =
            fault.deadline &&
            isPast(new Date(fault.deadline)) &&
            fault.statusFault !== 'Completed';

          return (
            <li
              key={fault._id}
              className={`${css.faultCard} ${isOverdue ? css.overdueCard : ''}`}
            >
              {isOverdue && <div className={css.overdueLabel}>SCADUTO</div>}

              <div className={css.cardHeader}>
                <span className={css.faultId}>{fault.faultId}</span>
                <span
                  className={`${css.statusBadge} ${css[`status${fault.statusFault}`]}`}
                >
                  {fault.statusFault}
                </span>
              </div>

              <div className={css.mainInfo}>
                <p className={css.plantName}>
                  <strong>Macchina:</strong> {fault.plantId?.namePlant || '---'}
                </p>
                <p className={css.partName}>
                  {fault.partId?.namePlantPart || '---'}
                </p>
              </div>

              <div className={css.detailsGrid}>
                <div className={css.detailItem}>
                  <span className={css.label}>Manutentore</span>
                  <p className={css.value}>
                    {fault.assignedMaintainers?.length
                      ? fault.assignedMaintainers.join(', ')
                      : 'Non assegnato'}
                  </p>
                </div>
                <div className={css.detailItem}>
                  <span className={css.label}>Priorità</span>
                  <span
                    className={`${css.priorityBadge} ${css[fault.priority.toLowerCase()]}`}
                  >
                    {fault.priority}
                  </span>
                </div>
              </div>

              <div className={css.cardFooter}>
                <div className={css.deadlineBlock}>
                  <span className={css.label}>Scadenza</span>
                  <p
                    className={`${css.deadlineText} ${isOverdue ? css.overdueText : ''}`}
                  >
                    {fault.deadline
                      ? format(new Date(fault.deadline), 'dd/MM/yyyy HH:mm')
                      : '---'}
                  </p>
                </div>
                <button
                  className={css.detailsBtn}
                  onClick={() => handleDetailClick(fault._id)}
                >
                  Dettagli
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FaultDeadlineOverview;
