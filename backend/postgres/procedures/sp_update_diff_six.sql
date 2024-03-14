create or replace procedure public.sp_update_diff_six(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg_diff record;
       diff_count int := 0;
      _rows int := 0;

begin

    execute 'update ' || p_tabela || ' set diff = null where uuid = $1 and dict in(1,2) and diff is not null' using p_uuid;

    -- Marca registros que existe no dicionário 1, mas não existem no dicionário 2
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on (
								s2.uuid = s.uuid and 
								s2.dict = 2 and	
								s2.indice = s.indice and 
								s2.ordem = s.ordem and 
								s2.chave = s.chave) 
								where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 1 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existe no dicionário 2, mas não existem no dicionário 1
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on (
								s2.uuid = s.uuid and 
								s2.dict = 1 and	
								s2.indice = s.indice and 
								s2.ordem = s.ordem and 
								s2.chave = s.chave) 
								where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 2 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existem dos dois dicionários, mas possuem diferenças
	v_query_select_dict_1 := 'select s.id, s2.id as id_diff from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
							(
								s2.uuid = s.uuid and 
								s2.dict = 2 and
								s2.indice = s.indice and 
								s2.ordem = s.ordem and 
								s2.chave = s.chave and
								(
			                        s.descricao <> s2.descricao or
			                        s.descspa <> s2.descspa or
			                        s.desceng <> s2.desceng or
			                        s.propri <> s2.propri or
			                        s.f3 <> s2.f3 or
			                        s.nickname <> s2.nickname or
			                        s.showpesq <> s2.showpesq or
			                        s.ix_virtual <> s2.ix_virtual or
			                        s.ix_vircust <> s2.ix_vircust
								)
							)
							where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is not null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id, diff_count;	                	
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id_diff, diff_count;
		
	end loop;
end 
$$;
