create trigger tg_processa_diff before
update
    on
    public.queue for each row
    when ((old.* is distinct
from
    new.*)) execute function fn_processa_diff()
